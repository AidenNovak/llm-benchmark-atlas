# Data policy

## Demo data

The built-in catalog uses illustrative values to exercise layout and chart
logic. Every SVG displays `DEMO DATA`, and every component carries a data note.
Demo values must never be represented as a current vendor or leaderboard claim.

## Real benchmark adapters

A real dataset integration should include:

- benchmark and dataset version;
- evaluation date;
- model snapshot or API version;
- prompt/scaffold/tool protocol;
- sampling parameters and number of runs;
- metric and unit;
- uncertainty method when applicable;
- source URL and license;
- any transformations or normalization.

Do not compare values with materially different protocols unless the visual
explicitly separates them.

## Source artwork

Source screenshots and saved web pages may be used locally for research. They
are not included in the public repository unless their license clearly permits
redistribution. Public components reproduce information grammar in original
code rather than embedding vendor artwork.
