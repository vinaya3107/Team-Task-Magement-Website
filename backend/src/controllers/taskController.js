const db = require('../config/db');

/* ------------------------------------------------------------------ */
/* GET /api/tasks                                                      */
/* Query params: project_id, status, assigned_to, page, limit, search */
/* ------------------------------------------------------------------ */
const getTasks = async (req, res, next) => {
  try {
    const {
      project_id,
      status,
      assigned_to,
      search = '',
      page  = 1,
      limit = 20,
    } = req.query;

    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    const offset   = (pageNum - 1) * limitNum;

    const conditions = [];
    const params     = [];
    let   idx        = 1;

    // MEMBER can only see tasks assigned to them or in their projects
    if (req.user.role === 'MEMBER') {
      conditions.push(`(t.assigned_to = $${idx} OR t.project_id IN (
        SELECT project_id FROM project_members WHERE user_id = $${idx}
      ))`);
      params.push(req.user.id);
      idx++;
    }

    if (project_id) {
      conditions.push(`t.project_id = $${idx++}`);
      params.push(parseInt(project_id));
    }
    if (status) {
      conditions.push(`t.status = $${idx++}`);
      params.push(status);
    }
    if (assigned_to) {
      conditions.push(`t.assigned_to = $${idx++}`);
      params.push(parseInt(assigned_to));
    }
    if (search) {
      conditions.push(`(t.title ILIKE $${idx} OR t.description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const dataQuery = `
      SELECT t.*,
             u.name  AS assignee_name,
             p.name  AS project_name,
             cb.name AS created_by_name,
             CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'Done' THEN true ELSE false END AS is_overdue
      FROM tasks t
      LEFT JOIN users u   ON u.id  = t.assigned_to
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN users cb  ON cb.id = t.created_by
      ${where}
      ORDER BY t.created_at DESC
      LIMIT $${idx++} OFFSET $${idx}
    `;
    params.push(limitNum, offset);

    const countQuery = `SELECT COUNT(*) FROM tasks t ${where}`;

    const [dataResult, countResult] = await Promise.all([
      db.query(dataQuery, params),
      db.query(countQuery, params.slice(0, params.length - 2)),
    ]);

    res.json({
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* GET /api/tasks/:id                                                  */
/* ------------------------------------------------------------------ */
const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `SELECT t.*,
              u.name  AS assignee_name,
              p.name  AS project_name,
              cb.name AS created_by_name,
              CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'Done' THEN true ELSE false END AS is_overdue
       FROM tasks t
       LEFT JOIN users u    ON u.id  = t.assigned_to
       LEFT JOIN projects p ON p.id  = t.project_id
       LEFT JOIN users cb   ON cb.id = t.created_by
       WHERE t.id = $1`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ message: 'Task not found' });

    const task = rows[0];

    // MEMBER access check
    if (req.user.role === 'MEMBER') {
      const memberCheck = await db.query(
        'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
        [task.project_id, req.user.id]
      );
      if (!memberCheck.rows.length && task.assigned_to !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* POST /api/tasks                                                     */
/* ------------------------------------------------------------------ */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status = 'Todo', due_date, project_id, assigned_to } = req.body;

    // Verify project exists
    const project = await db.query('SELECT id FROM projects WHERE id = $1', [project_id]);
    if (!project.rows.length) return res.status(404).json({ message: 'Project not found' });

    // Verify assignee exists (if provided)
    if (assigned_to) {
      const assignee = await db.query('SELECT id FROM users WHERE id = $1', [assigned_to]);
      if (!assignee.rows.length) return res.status(404).json({ message: 'Assignee not found' });
    }

    const { rows } = await db.query(
      `INSERT INTO tasks (title, description, status, due_date, project_id, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description || null, status, due_date || null, project_id, assigned_to || null, req.user.id]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* PUT /api/tasks/:id                                                  */
/* ------------------------------------------------------------------ */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, due_date, assigned_to } = req.body;

    const existing = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (!existing.rows.length) return res.status(404).json({ message: 'Task not found' });

    const task = existing.rows[0];

    // MEMBER can only update status of their assigned tasks
    if (req.user.role === 'MEMBER') {
      if (task.assigned_to !== req.user.id) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
      // Members can only change status
      const { rows } = await db.query(
        `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status || task.status, id]
      );
      return res.json(rows[0]);
    }

    const { rows } = await db.query(
      `UPDATE tasks
       SET title       = COALESCE($1, title),
           description = $2,
           status      = COALESCE($3, status),
           due_date    = $4,
           assigned_to = $5,
           updated_at  = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        title || null,
        description !== undefined ? description : task.description,
        status || null,
        due_date !== undefined ? due_date : task.due_date,
        assigned_to !== undefined ? assigned_to : task.assigned_to,
        id,
      ]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* DELETE /api/tasks/:id                                               */
/* ------------------------------------------------------------------ */
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT id FROM tasks WHERE id = $1', [id]);
    if (!existing.rows.length) return res.status(404).json({ message: 'Task not found' });

    await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
