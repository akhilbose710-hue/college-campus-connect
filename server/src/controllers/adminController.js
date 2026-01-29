const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

// Initialize with Service Role Key for Admin Privileges
let supabaseAdmin;
if (config.supabase.serviceKey) {
    supabaseAdmin = createClient(
        config.supabase.url,
        config.supabase.serviceKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
} else {
    console.warn('WARNING: SUPABASE_SERVICE_KEY is not set. Admin features will be disabled.');
}

// Helper to check init
const ensureAdmin = (res) => {
    if (!supabaseAdmin) {
        res.status(503).json({ error: 'Admin configuration missing (Service Key)' });
        return false;
    }
    return true;
};

/**
 * Create a single user with metadata (Instructor, Student)
 */
exports.createUser = async (req, res, next) => {
    if (!ensureAdmin(res)) return;
    try {
        const { email, password, name, role, metadata } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, and role are required' });
        }

        // 1. Create User in Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name, role, ...metadata },
            app_metadata: { roles: [role] } // Critical for our new structure
        });

        if (authError) throw authError;

        // 2. Add to public.users (trigger usually does this, but we update roles)
        const userId = authData.user.id;
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .update({ roles: [role] })
            .eq('id', userId);

        if (dbError) console.error('DB Update Error:', dbError);

        res.status(201).json({ message: 'User created successfully', user: authData.user });
    } catch (error) {
        next(error);
    }
};

/**
 * Bulk Create Users
 */
exports.bulkCreateUsers = async (req, res, next) => {
    if (!ensureAdmin(res)) return;
    try {
        const { users } = req.body; // Array of { email, password, name, role, metadata }

        if (!Array.isArray(users)) {
            return res.status(400).json({ error: 'Users must be an array' });
        }

        const results = { success: 0, failed: 0, errors: [] };

        for (const user of users) {
            try {
                const { error } = await supabaseAdmin.auth.admin.createUser({
                    email: user.email,
                    password: user.password || 'Campus@123', // Default password if missing
                    email_confirm: true,
                    user_metadata: { full_name: user.name, role: user.role, ...user.metadata },
                    app_metadata: { roles: [user.role] }
                });

                if (error) throw error;
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({ email: user.email, error: err.message });
            }
        }

        res.json({ message: 'Bulk processing complete', results });
    } catch (error) {
        next(error);
    }
};

/**
 * Promote Students: Semester + 1
 * If Semester > 8, Delete User
 */
exports.promoteStudents = async (req, res, next) => {
    if (!ensureAdmin(res)) return;
    try {
        // 1. List all users who are students
        // NOTE: Listing thousands of users might need pagination. simplified for now.
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) throw error;

        let promoted = 0;
        let graduated = 0; // Deleted

        for (const user of users) {
            const roles = user.app_metadata?.roles || [];
            if (roles.includes('STUDENT')) {
                const currentSem = user.user_metadata?.semester;
                // Assuming format "1st Semester", "2nd Semester" or just numbers
                let semNum = parseInt(currentSem);

                if (isNaN(semNum)) continue; // Skip if invalid

                if (semNum >= 8) {
                    // Graduate/Delete
                    await supabaseAdmin.auth.admin.deleteUser(user.id);
                    graduated++;
                } else {
                    // Promote
                    const newSem = semNum + 1;
                    await supabaseAdmin.auth.admin.updateUserById(user.id, {
                        user_metadata: {
                            ...user.user_metadata,
                            semester: `${newSem}${getOrdinal(newSem)} Semester`
                        }
                    });
                    promoted++;
                }
            }
        }

        res.json({ message: 'Promotion complete', promoted, graduated });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Total User Count
 */
exports.getStats = async (req, res, next) => {
    if (!ensureAdmin(res)) return;
    try {
        // Simplified count. For production, maybe use a DB count query.
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) throw error;

        res.json({ totalUsers: users.length });
    } catch (error) {
        next(error);
    }
}

// Helper
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}
