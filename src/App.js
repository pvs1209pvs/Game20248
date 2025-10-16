
import { useState, useEffect } from "react"

const SIZE = 4

const styles = {
	container: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
		color: "#333",
		padding: "16px",
	},
	title: {
		marginBottom: "16px",
	},
	gameOver: {
		color: "red",
		marginBottom: "8px",
	},
	table: {
		borderCollapse: "separate",
		borderSpacing: "8px",
		background: "#bbada0",
		padding: "8px",
		borderRadius: "8px",
	},
	cell: {
		width: "60px",
		height: "60px",
		textAlign: "center",
		verticalAlign: "middle",
		fontWeight: "bold",
		borderRadius: "5px",
		background: "#cdc1b4",
		color: "#776e65",
	},
	cell2: { background: "#eee4da", color: "#776e65" },
	cell4: { background: "#ede0c8", color: "#776e65" },
	cell8: { background: "#f2b179", color: "#f9f6f2" },
	cell16: { background: "#f59563", color: "#f9f6f2" },
	cell32: { background: "#f67c5f", color: "#f9f6f2" },
	cell64: { background: "#f65e3b", color: "#f9f6f2" },
	cell128: { background: "#edcf72", color: "#f9f6f2" },
	cell256: { background: "#edcc61", color: "#f9f6f2" },
	cell512: { background: "#edc850", color: "#f9f6f2" },
	cell1024: { background: "#edc53f", color: "#f9f6f2" },
	cell2048: { background: "#edc22e", color: "#f9f6f2" },
	  button: {
    padding: "10px 20px",
    marginTop: "20px",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#8f7a66",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  buttonHover: {
    backgroundColor: "#9f8b76",
  }
}

function makeBlankBoard() {
	return Array(SIZE)
		.fill(null)
		.map(() => Array(SIZE).fill(0))
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max)
}

function makeBoardCopy(board) {
	return board.map(row => [...row])
};

const addRandomTile = (board) => {

	const zeroTiles = [];

	// grab all the non empty tiles
	for (let i = 0; i < SIZE; i++) {
		for (let j = 0; j < SIZE; j++) {
			if (board[i][j] === 0) zeroTiles.push([i, j])
		}
	}

	if (zeroTiles.length === 0) return board;
	// add a 2 or a 4 to any one of the empty tiles
	const [i, j] = zeroTiles[getRandomInt(zeroTiles.length)]
	board[i][j] = Math.random() < 0.9 ? 2 : 4

	return board

};

function rotateBoard(board) {

	const newGrid = [];

	for (let col = 0; col < SIZE; col++) {

		const newRow = [];

		for (let row = 0; row < SIZE; row++) {
			newRow.push(board[row][col]);

		}

		newRow.reverse();
		newGrid.push(newRow);

	}

	return newGrid;

}

function mergeBoardTiles(board) {

	let moved = false;

	const newBoard = board.map(row => {

		// Get non-zere tiles
		const newRow = row.filter(tile => tile !== 0);

		for (let i = 0; i < newRow.length - 1; i++) {
			if (newRow[i] === newRow[i + 1]) {
				newRow[i] *= 2;
				newRow[i + 1] = 0;
				moved = true;
			}
		}

		// pad empty tiles to make a 4 tiles long row
		const finalRow = newRow.filter(val => val !== 0);
		while (finalRow.length < SIZE) finalRow.push(0);

		if (!moved) {
			for (let i = 0; i < SIZE; i++) {
				// Check at least if any anything move if nothing merged
				if (finalRow[i] !== row[i]) {
					moved = true;
					break;
				}
			}
		}

		return finalRow;

	});

	return { newBoard, moved }

}

function initBoardState() {
	return addRandomTile(addRandomTile(makeBlankBoard()))
}
export function Game2048() {

	const [gameBoard, setGameBoard] = useState(initBoardState());
	const [isGameOver, setIsGameOver] = useState(false);

	function onRestartClick(){
		setGameBoard(initBoardState())
	}

	const handleKeyDown = (e) => {

		if (isGameOver) return;

		let rotated = false;
		let tempGrid = makeBoardCopy(gameBoard);

		// Rotate grid to avoid repeating same code again and again
		if (e.key === "ArrowUp") {
			tempGrid = rotateBoard(rotateBoard(rotateBoard(tempGrid)));
			rotated = true;
		} else if (e.key === "ArrowDown") {
			tempGrid = rotateBoard(tempGrid);
			rotated = true;
		} else if (e.key === "ArrowRight") {
			tempGrid = rotateBoard(rotateBoard(tempGrid));
			rotated = true;
		} else if (e.key !== "ArrowLeft") {
			// do not take action if any other key was pressed
			return;
		}

		const { newGrid, moved } = mergeBoardTiles(tempGrid);

		let finalGrid = newGrid;

		// rotate it back to its originan orientation
		if (rotated) {
			const rotations = { "ArrowUp": 1, "ArrowDown": 3, "ArrowRight": 2 };
			for (let i = 0; i < rotations[e.key]; i++) finalGrid = rotateBoard(finalGrid);
		}

		if (moved) {
			// merge mergeable tiles
			setGameBoard(addRandomTile(finalGrid));
		} else {
			// check if any more moves are left
			const canMove = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].some(dir => {
				let testGrid = makeBoardCopy(gameBoard);

				if (dir === "ArrowUp") testGrid = rotateBoard(rotateBoard(rotateBoard(testGrid)));
				if (dir === "ArrowDown") testGrid = rotateBoard(testGrid);
				if (dir === "ArrowRight") testGrid = rotateBoard(rotateBoard(testGrid));

				const { moved: canMove } = mergeBoardTiles(testGrid);

				return canMove;

			});
			if (!canMove) setIsGameOver(true);
		}
	};

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [gameBoard, isGameOver]);

	function getCellStyle(titeValue) {
		switch (titeValue) {
			case 2: return { ...styles.cell, ...styles.cell2 };
			case 4: return { ...styles.cell, ...styles.cell4 };
			case 8: return { ...styles.cell, ...styles.cell8 };
			case 16: return { ...styles.cell, ...styles.cell16 };
			case 32: return { ...styles.cell, ...styles.cell32 };
			case 64: return { ...styles.cell, ...styles.cell64 };
			case 128: return { ...styles.cell, ...styles.cell128 };
			case 256: return { ...styles.cell, ...styles.cell256 };
			case 512: return { ...styles.cell, ...styles.cell512 };
			case 1024: return { ...styles.cell, ...styles.cell1024 };
			case 2048: return { ...styles.cell, ...styles.cell2048 };
			default: return styles.cell;
		}
	};

	return (
		<div style={styles.container}>

			<h1 style={styles.title}>2048 Game by Paramvir Singh</h1>
			
			{isGameOver && <h2 style={styles.gameOver}>Game Over!</h2>}
			
			<table style={styles.table}>
				<tbody>
					{gameBoard.map((row, i) => (
						<tr key={i}>
							{row.map((cell, j) => (
								<td key={j} style={getCellStyle(cell)}>
									{cell !== 0 ? cell : ""}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>

			<button style={styles.button} onClick={onRestartClick}>Restart</button>

		</div>
	);
}

function App() {
	return (
		<div className="App">
			<Game2048 />
		</div>
	);
}

export default App;
