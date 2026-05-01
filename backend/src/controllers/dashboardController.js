const db = require('../config/db');

/* ------------------------------------------------------------------ */
/* GET /api/dashboard                                                  */
/* ------------------------------------------------------------------ */
const getDashboard = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const userId  = req.user.id;

    // Base filter
    const userFilter = isAdmin
      ? ''
      : `AND (t.assigned_to = ${userId} OR t.project_id IN (
           SELECT project_id FROM project_members WHERE user_id = ${userId}
         ))`;

    const [totalResult, completedResult, pendingResult, overdueResult, recentResult, projectCount] =
      await Promise.all([
        // Total tasks
        db.query(`SELECT COUNT(*) FROM tasks t WHERE 1=1 ${userFilter}`),
        // Completed tasks
        db.query(`SELECT COUNT(*) FROM tasks t WHERE status = 'Done' ${userFilter}`),
        // Pending (Todo + In Progress)
        db.query(`SELECT COUNT(*) FROM tasks t WHERE status != 'Done' ${userFilter}`),
        // Overdue
        db.query(
          `SELECT COUNT(*) FROM tasks t WHERE due_date < CURRENT_DATE AND status != 'Done' ${userFilter}`
        ),
        // Recent tasks (last 5)
        db.query(
          `SELECT t.*, u.name AS assignee_name, p.name AS project_name,
                  CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'Done' THEN true ELSE false END AS is_overdue
           FROM tasks t
           LEFT JOIN users u ON u.id = t.assigned_to
           LEFT JOIN projects p ON p.id = t.project_id
           WHERE 1=1 ${userFilter}
           ORDER BY t.created_at DESC LIMIT 5`
        ),
        // Project count
        isAdmin
          ? db.query('SELECT COUNT(*) FROM projects')
          : db.query(
              `SELECT COUNT(DISTINCT project_id) FROM (
                 SELECT project_id FROM project_members WHERE user_id = $1
                 UNION
                 SELECT project_id FROM tasks WHERE assigned_to = $1
               ) AS user_projects`,
              [userId]
            ),
      ]);

    // Status breakdown
    const statusBreakdown = await db.query(
      `SELECT status, COUNT(*)::int AS count
       FROM tasks t
       WHERE 1=1 ${userFilter}
       GROUP BY status`
    );

    res.json({
      stats: {
        total:     parseInt(totalResult.rows[0].count),
        completed: parseInt(completedResult.rows[0].count),
        pending:   parseInt(pendingResult.rows[0].count),
        overdue:   parseInt(overdueResult.rows[0].count),
        projects:  parseInt(projectCount.rows[0].count),
      },
      statusBreakdown: statusBreakdown.rows,
      recentTasks:     recentResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
