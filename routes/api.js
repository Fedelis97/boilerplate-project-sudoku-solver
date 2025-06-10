"use strict";

const SudokuSolver = require("../controllers/sudoku-solver.js");

const regexValue = /^[1-9]$/;
const regexCoordinate = /^[A-I][1-9]$/;

// In-memory storage for issues (in production use a database)
let issues = {};

module.exports = function (app) {
  let solver = new SudokuSolver();

  // Sudoku routes
  app.route("/api/check").post((req, res) => {
    const { coordinate, value, puzzle } = req.body;

    if (!puzzle || !coordinate || !value) {
      return res.json({ error: "Required field(s) missing" });
    }

    if (!regexValue.test(value)) {
      return res.json({ error: 'Invalid value' });
    }

    if (!regexCoordinate.test(coordinate)) {
      return res.json({ error: 'Invalid coordinate' });
    }

    const validationResult = solver.validate(puzzle);
    if (validationResult !== true) {
      return res.json({ error: validationResult });
    }

    const row = coordinate.charCodeAt(0) - 65; // A=0, B=1, etc.
    const col = parseInt(coordinate[1]) - 1; // 1=0, 2=1, etc.

    const conflicts = [];
    
    if (!solver.checkRowPlacement(puzzle, row, col, value)) {
      conflicts.push("row");
    }
    
    if (!solver.checkColPlacement(puzzle, row, col, value)) {
      conflicts.push("column");
    }
    
    if (!solver.checkRegionPlacement(puzzle, row, col, value)) {
      conflicts.push("region");
    }

    if (conflicts.length > 0) {
      return res.json({ valid: false, conflict: conflicts });
    }

    res.json({ valid: true });
  });

  app.route("/api/solve").post((req, res) => {
    const { puzzle } = req.body;

    if (!puzzle) {
      return res.json({ error: "Required field missing" });
    }

    const validationResult = solver.validate(puzzle);
    if (validationResult !== true) {
      return res.json({ error: validationResult });
    }

    const solution = solver.solve(puzzle);
    
    if (!solution) {
      return res.json({ error: "Puzzle cannot be solved" });
    }

    res.json({ solution: solution });
  });

  // Issue tracker routes
  app.route("/api/issues/:project")
    .get((req, res) => {
      const project = req.params.project;
      
      // Ensure we always return an array, even if no issues exist
      if (!issues[project]) {
        issues[project] = [];
      }
      
      const projectIssues = issues[project];
      
      // Apply filters from query parameters
      let filteredIssues = projectIssues;
      
      const filters = req.query;
      if (Object.keys(filters).length > 0) {
        filteredIssues = projectIssues.filter(issue => {
          return Object.keys(filters).every(key => {
            if (key === 'open') {
              return issue[key].toString() === filters[key];
            }
            return issue[key] && issue[key].toString().toLowerCase().includes(filters[key].toLowerCase());
          });
        });
      }
      
      res.json(filteredIssues);
    })
    
    .post((req, res) => {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      
      // Check required fields
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      
      // Create new issue
      const newIssue = {
        _id: new Date().getTime().toString(), // Simple ID generation
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        open: true
      };
      
      // Initialize project issues array if it doesn't exist
      if (!issues[project]) {
        issues[project] = [];
      }
      
      issues[project].push(newIssue);
      res.json(newIssue);
    })
    
    .put((req, res) => {
      const project = req.params.project;
      const { _id, ...updateFields } = req.body;
      
      // Check if _id is provided
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      
      // Check if there are fields to update
      const validUpdateFields = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open'];
      const fieldsToUpdate = Object.keys(updateFields).filter(key => validUpdateFields.includes(key));
      
      if (fieldsToUpdate.length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }
      
      // Find and update the issue
      const projectIssues = issues[project] || [];
      const issueIndex = projectIssues.findIndex(issue => issue._id === _id);
      
      if (issueIndex === -1) {
        return res.json({ error: 'could not update', '_id': _id });
      }
      
      // Update the issue
      fieldsToUpdate.forEach(field => {
        if (field === 'open') {
          projectIssues[issueIndex][field] = updateFields[field] === 'true' || updateFields[field] === true;
        } else {
          projectIssues[issueIndex][field] = updateFields[field];
        }
      });
      
      projectIssues[issueIndex].updated_on = new Date().toISOString();
      
      res.json({ result: 'successfully updated', '_id': _id });
    })
    
    .delete((req, res) => {
      const project = req.params.project;
      const { _id } = req.body;
      
      // Check if _id is provided
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      
      // Find and delete the issue
      const projectIssues = issues[project] || [];
      const issueIndex = projectIssues.findIndex(issue => issue._id === _id);
      
      if (issueIndex === -1) {
        return res.json({ error: 'could not delete', '_id': _id });
      }
      
      projectIssues.splice(issueIndex, 1);
      res.json({ result: 'successfully deleted', '_id': _id });
    });
};