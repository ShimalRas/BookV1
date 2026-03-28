# Monte Carlo Dart Simulation

This Python script estimates the value of π (pi) using the Monte Carlo method. The simulation works by "throwing" random darts at a square target with a quarter circle inscribed in it. By calculating the ratio of darts that land inside the circle to the total number of darts thrown, we can estimate π.

## How It Works

1. Generate random points (x, y) within a unit square [0,1] × [0,1]
2. Check if each point falls inside the unit quarter circle (x² + y² ≤ 1)
3. The ratio of points inside the circle to total points approximates π/4
4. Therefore, π ≈ 4 × (points_inside / total_points)

## Usage

Run the script from the command line:

```bash
python monte_carlo_darts.py
```

The script will simulate throwing 1,000,000 darts by default and display:
- The estimated value of π
- The actual value of π (from math.pi)
- The absolute error
- The percentage accuracy

## Customization

You can modify the `num_darts` variable in the `main()` function to change the number of darts thrown. More darts generally provide a more accurate estimate but take longer to run.

## Requirements

- Python 3.x
- Standard library modules: `random`, `math`

No external dependencies required.