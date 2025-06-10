const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  suite('POST /api/issues/{project} => object with issue data', function() {
    
    test('Create an issue with every field', function(done) {
      chai.request(server)
        .post('/api/issues/test-project')
        .send({
          issue_title: 'Complete issue',
          issue_text: 'This is a complete issue with all fields',
          created_by: 'Test User',
          assigned_to: 'Developer',
          status_text: 'In Progress'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Complete issue');
          assert.equal(res.body.issue_text, 'This is a complete issue with all fields');
          assert.equal(res.body.created_by, 'Test User');
          assert.equal(res.body.assigned_to, 'Developer');
          assert.equal(res.body.status_text, 'In Progress');
          assert.equal(res.body.open, true);
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          done();
        });
    });
    
    test('Create an issue with only required fields', function(done) {
      chai.request(server)
        .post('/api/issues/test-project')
        .send({
          issue_title: 'Required only',
          issue_text: 'This issue has only required fields',
          created_by: 'Test User'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Required only');
          assert.equal(res.body.issue_text, 'This issue has only required fields');
          assert.equal(res.body.created_by, 'Test User');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.equal(res.body.open, true);
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          done();
        });
    });
    
    test('Create an issue with missing required fields', function(done) {
      chai.request(server)
        .post('/api/issues/test-project')
        .send({
          issue_title: 'Missing fields'
          // Missing issue_text and created_by
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
    
  });
  
  suite('GET /api/issues/{project} => Array of objects with issue data', function() {
    
    test('View issues on a project', function(done) {
      chai.request(server)
        .get('/api/issues/test-project')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          if (res.body.length > 0) {
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], '_id');
          }
          done();
        });
    });
    
    test('View issues on a project with one filter', function(done) {
      chai.request(server)
        .get('/api/issues/test-project?open=true')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          if (res.body.length > 0) {
            res.body.forEach(issue => {
              assert.equal(issue.open, true);
            });
          }
          done();
        });
    });
    
    test('View issues on a project with multiple filters', function(done) {
      chai.request(server)
        .get('/api/issues/test-project?open=true&created_by=Test User')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          if (res.body.length > 0) {
            res.body.forEach(issue => {
              assert.equal(issue.open, true);
              assert.equal(issue.created_by, 'Test User');
            });
          }
          done();
        });
    });
    
  });
  
  suite('PUT /api/issues/{project} => text', function() {
    let testId;
    
    // Create a test issue to update
    before(function(done) {
      chai.request(server)
        .post('/api/issues/test-project')
        .send({
          issue_title: 'Update test',
          issue_text: 'Issue for update testing',
          created_by: 'Test User'
        })
        .end(function(err, res) {
          testId = res.body._id;
          done();
        });
    });
    
    test('Update one field on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/test-project')
        .send({
          _id: testId,
          issue_title: 'Updated title'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testId);
          done();
        });
    });
    
    test('Update multiple fields on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/test-project')
        .send({
          _id: testId,
          issue_title: 'Multi updated title',
          issue_text: 'Multi updated text',
          open: false
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testId);
          done();
        });
    });
    
    test('Update an issue with missing _id', function(done) {
      chai.request(server)
        .put('/api/issues/test-project')
        .send({
          issue_title: 'Missing ID update'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    
    test('Update an issue with no fields to update', function(done) {
      chai.request(server)
        .put('/api/issues/test-project')
        .send({
          _id: testId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no update field(s) sent');
          assert.equal(res.body._id, testId);
          done();
        });
    });
    
    test('Update an issue with an invalid _id', function(done) {
      chai.request(server)
        .put('/api/issues/test-project')
        .send({
          _id: 'invalid_id_12345',
          issue_title: 'Invalid ID update'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not update');
          assert.equal(res.body._id, 'invalid_id_12345');
          done();
        });
    });
    
  });
  
  suite('DELETE /api/issues/{project} => text', function() {
    let deleteTestId;
    
    // Create a test issue to delete
    before(function(done) {
      chai.request(server)
        .post('/api/issues/test-project')
        .send({
          issue_title: 'Delete test',
          issue_text: 'Issue for delete testing',
          created_by: 'Test User'
        })
        .end(function(err, res) {
          deleteTestId = res.body._id;
          done();
        });
    });
    
    test('Delete an issue', function(done) {
      chai.request(server)
        .delete('/api/issues/test-project')
        .send({
          _id: deleteTestId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, deleteTestId);
          done();
        });
    });
    
    test('Delete an issue with an invalid _id', function(done) {
      chai.request(server)
        .delete('/api/issues/test-project')
        .send({
          _id: 'invalid_id_12345'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, 'invalid_id_12345');
          done();
        });
    });
    
    test('Delete an issue with missing _id', function(done) {
      chai.request(server)
        .delete('/api/issues/test-project')
        .send({})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    
  });
  
});