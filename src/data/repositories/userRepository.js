/**
 * User Repository Implementation
 */

const { UserRepositoryInterface } = require('../../core/interfaces/repositories');
const { User } = require('../../core/entities');
const { createError } = require('../../api/middleware/errorHandler');

class UserRepository extends UserRepositoryInterface {
  /**
   * Constructor
   * @param {Object} db - Database connection
   */
  constructor(db) {
    super();
    this.db = db;
  }

  /**
   * Find user by ID
   * @param {string|number} id - User ID
   * @returns {Promise<User|null>} - User or null if not found
   */
  async findById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(null);
          resolve(new User(row));
        }
      );
    });
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<User|null>} - User or null if not found
   */
  async findByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(null);
          resolve(new User(row));
        }
      );
    });
  }

  /**
   * Find all users with optional filtering
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Array<User>>} - Array of users
   */
  async findAll(filter = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM users';
      const params = [];

      // Apply filters if provided
      if (Object.keys(filter).length > 0) {
        const conditions = [];
        
        if (filter.role) {
          conditions.push('role = ?');
          params.push(filter.role);
        }
        
        if (filter.search) {
          conditions.push('(firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)');
          const searchTerm = `%${filter.search}%`;
          params.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (conditions.length > 0) {
          query += ` WHERE ${conditions.join(' AND ')}`;
        }
      }
      
      // Add ordering
      query += ' ORDER BY createdAt DESC';
      
      this.db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(row => new User(row)));
      });
    });
  }

  /**
   * Create a new user
   * @param {User} user - User entity
   * @returns {Promise<User>} - Created user
   */
  async create(user) {
    return new Promise((resolve, reject) => {
      const { firstName, lastName, email, password, role } = user;
      
      this.db.run(
        `INSERT INTO users (firstName, lastName, email, password, role, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          firstName,
          lastName,
          email,
          password,
          role || 'user',
          new Date().toISOString(),
          new Date().toISOString()
        ],
        function(err) {
          if (err) {
            // Check for unique constraint violation
            if (err.code === 'SQLITE_CONSTRAINT') {
              return reject(createError(
                'CONFLICT_ERROR',
                'User with this email already exists'
              ));
            }
            return reject(err);
          }
          
          // Get the created user
          this.db.get(
            'SELECT * FROM users WHERE id = ?',
            [this.lastID],
            (err, row) => {
              if (err) return reject(err);
              resolve(new User(row));
            }
          );
        }.bind(this)
      );
    });
  }

  /**
   * Update an existing user
   * @param {string|number} id - User ID
   * @param {Object} data - Updated user data
   * @returns {Promise<User>} - Updated user
   */
  async update(id, data) {
    return new Promise((resolve, reject) => {
      // Prevent updating certain fields
      const { password, createdAt, id: userId, ...updateData } = data;
      
      // Add updatedAt timestamp
      updateData.updatedAt = new Date().toISOString();
      
      // Build update query
      const fields = Object.keys(updateData);
      const placeholders = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updateData[field]);
      
      // Add id to values
      values.push(id);
      
      this.db.run(
        `UPDATE users SET ${placeholders} WHERE id = ?`,
        values,
        function(err) {
          if (err) return reject(err);
          
          if (this.changes === 0) {
            return reject(createError(
              'NOT_FOUND_ERROR',
              `User with ID ${id} not found`
            ));
          }
          
          // Get the updated user
          this.db.get(
            'SELECT * FROM users WHERE id = ?',
            [id],
            (err, row) => {
              if (err) return reject(err);
              resolve(new User(row));
            }
          );
        }.bind(this)
      );
    });
  }

  /**
   * Update user password
   * @param {string|number} id - User ID
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<boolean>} - Success flag
   */
  async updatePassword(id, hashedPassword) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET password = ?, updatedAt = ? WHERE id = ?',
        [hashedPassword, new Date().toISOString(), id],
        function(err) {
          if (err) return reject(err);
          
          if (this.changes === 0) {
            return reject(createError(
              'NOT_FOUND_ERROR',
              `User with ID ${id} not found`
            ));
          }
          
          resolve(true);
        }
      );
    });
  }

  /**
   * Delete a user
   * @param {string|number} id - User ID
   * @returns {Promise<boolean>} - Success flag
   */
  async delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM users WHERE id = ?',
        [id],
        function(err) {
          if (err) return reject(err);
          
          if (this.changes === 0) {
            return reject(createError(
              'NOT_FOUND_ERROR',
              `User with ID ${id} not found`
            ));
          }
          
          resolve(true);
        }
      );
    });
  }
}

module.exports = UserRepository; 