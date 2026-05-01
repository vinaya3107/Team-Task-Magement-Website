const db = require('../config/db');

/* ------------------------------------------------------------------ */
/* GET /api/projects                                                   */
/* ADMIN  → all projects                                              */
/* MEMBER → only projects they belong to                              */
/* ------------------------------------------------------------------ */
const getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchParam = `%${search}%`;

    let query, params;

    if (req.user.role === 'ADMIN') {
      query = `
        SELECT p.*, u.name AS creator_name,
               COUNT(pm.user_id)::int AS member_count
        FROM projects p
        JOIN users u ON u.id = p.created_by
        LEFT JOIN project_members pm ON pm.project_id = p.id
        WHERE p.name ILIKE $1 OR p.description ILIKE $1
        GROUP BY p.id, u.name
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      params = [searchParam, parseInt(limit), offset];
    } else {
      query = `
        SELECT p.*, u.name AS creator_name,
               COUNT(pm2.user_id)::int AS member_count
        FROM projects p
        JOIN users u ON u.id = p.created_by
        LEFT JOIN project_members pm2 ON pm2.project_id = p.id
        WHERE p.id IN (
            SELECT project_id FROM project_members WHERE user_id = $1
            UNION
            SELECT project_id FROM tasks WHERE assigned_to = $1
        )
        AND (p.name ILIKE $2 OR p.description ILIKE $2)
        GROUP BY p.id, u.name
        ORDER BY p.created_at DESC
        LIMIT $3 OFFSET $4
      `;
      params = [req.user.id, searchParam, parseInt(limit), offset];
    }

    const { rows } = await db.query(query, params);

    // Count total
    let countQuery, countParams;
    if (req.user.role === 'ADMIN') {
      countQuery = `SELECT COUNT(*) FROM projects WHERE name ILIKE $1 OR description ILIKE $1`;
      countParams = [searchParam];
    } else {
      countQuery = `
        SELECT COUNT(*) FROM projects p
        WHERE p.id IN (
            SELECT project_id FROM project_members WHERE user_id = $1
            UNION
            SELECT project_id FROM tasks WHERE assigned_to = $1
        )
        AND (p.name ILIKE $2 OR p.description ILIKE $2)
      `;
      countParams = [req.user.id, searchParam];
    }
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* GET /api/projects/:id                                               */
/* ------------------------------------------------------------------ */
const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `SELECT p.*, u.name AS creator_name
       FROM projects p
       JOIN users u ON u.id = p.created_by
       WHERE p.id = $1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Project not found' });

    const project = rows[0];

    // Check access for MEMBER
    if (req.user.role === 'MEMBER') {
      const access = await db.query(
        `SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2
         UNION
         SELECT 1 FROM tasks WHERE project_id = $1 AND assigned_to = $2`,
        [id, req.user.id]
      );
      if (!access.rows.length) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Fetch members
    const members = await db.query(
      `SELECT u.id, u.name, u.email, u.role, pm.joined_at
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1
       ORDER BY pm.joined_at`,
      [id]
    );

    res.json({ ...project, members: members.rows });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* POST /api/projects                                                  */
/* ------------------------------------------------------------------ */
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const { rows } = await db.query(
      `INSERT INTO projects (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, req.user.id]
    );

    const project = rows[0];

    // Auto-add creator as member
    await db.query(
      'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [project.id, req.user.id]
    );

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* PUT /api/projects/:id                                               */
/* ------------------------------------------------------------------ */
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (!existing.rows.length) return res.status(404).json({ message: 'Project not found' });

    const { rows } = await db.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [name || null, description !== undefined ? description : existing.rows[0].description, id]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* DELETE /api/projects/:id                                            */
/* ------------------------------------------------------------------ */
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT id FROM projects WHERE id = $1', [id]);
    if (!existing.rows.length) return res.status(404).json({ message: 'Project not found' });

    await db.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* POST /api/projects/:id/members                                      */
/* ------------------------------------------------------------------ */
const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) return res.status(400).json({ message: 'user_id is required' });

    const project = await db.query('SELECT id FROM projects WHERE id = $1', [id]);
    if (!project.rows.length) return res.status(404).json({ message: 'Project not found' });

    const user = await db.query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (!user.rows.length) return res.status(404).json({ message: 'User not found' });

    await db.query(
      'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [id, user_id]
    );

    res.status(201).json({ message: 'Member added successfully' });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* DELETE /api/projects/:id/members/:userId                            */
/* ------------------------------------------------------------------ */
const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    await db.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember };
