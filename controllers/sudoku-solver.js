class SudokuSolver {

  validate(puzzleString) {
    // Check if puzzle string is provided
    if (!puzzleString) {
      return "Required field missing";
    }
    
    // Check length
    if (puzzleString.length !== 81) {
      return "Expected puzzle to be 81 characters long";
    }
    
    // Check for invalid characters
    const validChars = /^[1-9.]*$/;
    if (!validChars.test(puzzleString)) {
      return "Invalid characters in puzzle";
    }
    
    return true;
  }

  checkRowPlacement(puzzleString, row, column, value) {
    // Check if the value already exists in the row
    for (let col = 0; col < 9; col++) {
      if (col !== column) {
        const index = row * 9 + col;
        if (puzzleString[index] === value.toString()) {
          return false;
        }
      }
    }
    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    // Check if the value already exists in the column
    for (let r = 0; r < 9; r++) {
      if (r !== row) {
        const index = r * 9 + column;
        if (puzzleString[index] === value.toString()) {
          return false;
        }
      }
    }
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    // Calculate the starting position of the 3x3 region
    const regionStartRow = Math.floor(row / 3) * 3;
    const regionStartCol = Math.floor(column / 3) * 3;
    
    // Check if the value already exists in the 3x3 region
    for (let r = regionStartRow; r < regionStartRow + 3; r++) {
      for (let c = regionStartCol; c < regionStartCol + 3; c++) {
        if (r !== row || c !== column) {
          const index = r * 9 + c;
          if (puzzleString[index] === value.toString()) {
            return false;
          }
        }
      }
    }
    return true;
  }

  solve(puzzleString) {
    const validationResult = this.validate(puzzleString);
    if (validationResult !== true) {
      return false;
    }
    
    // Convert string to array for easier manipulation
    let puzzle = puzzleString.split('');
    
    // Recursive backtracking function
    const solvePuzzle = () => {
      // Find the next empty cell
      for (let i = 0; i < 81; i++) {
        if (puzzle[i] === '.') {
          const row = Math.floor(i / 9);
          const col = i % 9;
          
          // Try numbers 1-9
          for (let num = 1; num <= 9; num++) {
            const numStr = num.toString();
            
            // Check if placement is valid
            if (this.checkRowPlacement(puzzle.join(''), row, col, numStr) &&
                this.checkColPlacement(puzzle.join(''), row, col, numStr) &&
                this.checkRegionPlacement(puzzle.join(''), row, col, numStr)) {
              
              // Place the number
              puzzle[i] = numStr;
              
              // Recursively solve the rest
              if (solvePuzzle()) {
                return true;
              }
              
              // Backtrack if no solution found
              puzzle[i] = '.';
            }
          }
          
          // No valid number found for this cell
          return false;
        }
      }
      
      // All cells filled successfully
      return true;
    };
    
    // Check if the initial puzzle is valid
    for (let i = 0; i < 81; i++) {
      if (puzzle[i] !== '.') {
        const row = Math.floor(i / 9);
        const col = i % 9;
        const value = puzzle[i];
        
        // Temporarily remove the value to check placement
        puzzle[i] = '.';
        
        if (!this.checkRowPlacement(puzzle.join(''), row, col, value) ||
            !this.checkColPlacement(puzzle.join(''), row, col, value) ||
            !this.checkRegionPlacement(puzzle.join(''), row, col, value)) {
          return false;
        }
        
        // Restore the value
        puzzle[i] = value;
      }
    }
    
    // Solve the puzzle
    if (solvePuzzle()) {
      return puzzle.join('');
    }
    
    return false;
  }
}

module.exports = SudokuSolver;