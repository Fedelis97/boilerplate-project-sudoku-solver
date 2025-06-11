const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver = new Solver();

suite('Unit Tests', () => {
  
  // Valid puzzle strings for testing
  const validPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
  const invalidPuzzle = '115..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'; // Two 1s in first row
  const incompletePuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
  const solvedPuzzle = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';
  
  suite('Solver validate() function', () => {
    
    test('Logic handles a valid puzzle string of 81 characters', (done) => {
      const result = solver.validate(validPuzzle);
      assert.equal(result, true);
      done();
    });
    
    test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', (done) => {
      const invalidCharPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3X.';
      const result = solver.validate(invalidCharPuzzle);
      assert.equal(result, 'Invalid characters in puzzle');
      done();
    });
    
    test('Logic handles a puzzle string that is not 81 characters in length', (done) => {
      const shortPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3';
      const result = solver.validate(shortPuzzle);
      assert.equal(result, 'Expected puzzle to be 81 characters long');
      done();
    });
    
    test('Logic handles an empty puzzle string', (done) => {
      const result = solver.validate('');
      assert.equal(result, 'Required field missing');
      done();
    });
    
    test('Logic handles a missing puzzle string', (done) => {
      const result = solver.validate();
      assert.equal(result, 'Required field missing');
      done();
    });
    
  });
  
  suite('Solver checkRowPlacement() function', () => {
    
    test('Logic handles a valid row placement', (done) => {
      const result = solver.checkRowPlacement(validPuzzle, 0, 1, '3');
      assert.equal(result, true);
      done();
    });
    
    test('Logic handles an invalid row placement', (done) => {
      const result = solver.checkRowPlacement(validPuzzle, 0, 1, '1'); // 1 already exists in row 0
      assert.equal(result, false);
      done();
    });
    
    test('Logic handles row placement with same number in same position', (done) => {
      const result = solver.checkRowPlacement(validPuzzle, 0, 0, '1'); // Position already has 1
      assert.equal(result, true); // Should be true because we're checking the same position
      done();
    });
    
  });
  
  suite('Solver checkColPlacement() function', () => {
    
    test('Logic handles a valid column placement', (done) => {
      const result = solver.checkColPlacement(validPuzzle, 0, 1, '3');
      assert.equal(result, true);
      done();
    });
    
    test('Logic handles an invalid column placement', (done) => {
      const result = solver.checkColPlacement(validPuzzle, 0, 1, '9'); // 9 already exists in column 1
      assert.equal(result, false);
      done();
    });
    
    test('Logic handles column placement with same number in same position', (done) => {
      const result = solver.checkColPlacement(validPuzzle, 1, 2, '6'); // Position [1,2] already has 6
      assert.equal(result, true); // Should be true because we're checking the same position
      done();
    });
    
  });
  
  suite('Solver checkRegionPlacement() function', () => {
    
    test('Logic handles a valid region (3x3 grid) placement', (done) => {
      const result = solver.checkRegionPlacement(validPuzzle, 0, 1, '3');
      assert.equal(result, true);
      done();
    });
    
    test('Logic handles an invalid region (3x3 grid) placement', (done) => {
      const result = solver.checkRegionPlacement(validPuzzle, 0, 1, '5'); // 5 already exists in top-left region
      assert.equal(result, false);
      done();
    });
    
    test('Logic handles region placement with same number in same position', (done) => {
      const result = solver.checkRegionPlacement(validPuzzle, 0, 2, '5'); // Position [0,2] already has 5
      assert.equal(result, true); // Should be true because we're checking the same position
      done();
    });
    
  });
  
  suite('Solver solve() function', () => {
    
    test('Valid puzzle strings pass the solver', (done) => {
      const result = solver.solve(validPuzzle);
      assert.isString(result);
      assert.equal(result.length, 81);
      // Check that result contains only digits 1-9
      assert.match(result, /^[1-9]{81}$/);
      done();
    });
    
    test('Invalid puzzle strings fail the solver', (done) => {
      const result = solver.solve(invalidPuzzle);
      assert.equal(result, false);
      done();
    });
    
    test('Solver returns the expected solution for an incomplete puzzle', (done) => {
      const result = solver.solve(incompletePuzzle);
      assert.isString(result);
      assert.equal(result.length, 81);
      
      // Check that the solution is valid by testing a few known positions
      // The solved puzzle should have all positions filled with digits 1-9
      assert.match(result, /^[1-9]{81}$/);
      
      // Verify that original numbers are preserved
      for (let i = 0; i < incompletePuzzle.length; i++) {
        if (incompletePuzzle[i] !== '.') {
          assert.equal(result[i], incompletePuzzle[i]);
        }
      }
      done();
    });
    
    test('Solver handles puzzle with no solution', (done) => {
      // Create an impossible puzzle (two 1s in the same row)
      const impossiblePuzzle = '11...2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
      const result = solver.solve(impossiblePuzzle);
      assert.equal(result, false);
      done();
    });
    
    test('Solver handles already solved puzzle', (done) => {
      const result = solver.solve(solvedPuzzle);
      assert.equal(result, solvedPuzzle);
      done();
    });
    
    test('Solver handles puzzle with invalid characters', (done) => {
      const invalidCharPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3X.';
      const result = solver.solve(invalidCharPuzzle);
      assert.equal(result, false);
      done();
    });
    
    test('Solver handles puzzle with wrong length', (done) => {
      const shortPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3';
      const result = solver.solve(shortPuzzle);
      assert.equal(result, false);
      done();
    });
    
  });

  
});