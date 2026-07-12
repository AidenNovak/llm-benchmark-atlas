# Product brief

## Problem

Model vendors, benchmark teams, and papers publish strong benchmark visuals,
but their reusable structure is fragmented across screenshots, blog HTML, PDFs,
and one-off plotting code. Existing galleries often count duplicates as
coverage and do not record when a chart should or should not be used.

## Product

Benchmark Atlas is an inspectable component catalog where every entry has:

- a source lineage;
- a unique information grammar;
- a named visual system;
- a benchmark-specific use case and misuse warning;
- structured demo data;
- a pure SVG renderer;
- machine validation and responsive QA.

## Primary users

1. Model labs preparing a release or technical report.
2. Evaluation teams building internal benchmark dashboards.
3. Researchers choosing a figure for an arXiv paper.
4. AI product teams explaining quality, cost, latency, and safety trade-offs.
5. Designers who need references beyond generic dashboard charts.

## Core jobs

- Find the right visual grammar for a benchmark story.
- Compare how different labs communicate similar evidence.
- Start from a maintainable renderer instead of tracing a screenshot.
- Export a self-contained SVG or inspect the data contract.
- Prevent misleading or duplicate visualizations from entering a design system.

## Differentiation

Benchmark Atlas is not a model leaderboard and not a screenshot archive. Its
unit of value is the reusable information grammar. Provenance and misuse notes
are part of the component contract, not optional documentation.

## Success metrics

- unique accepted grammars, not total card count;
- percentage of entries with first-party or paper provenance;
- renderer validation and visual-regression pass rate;
- time from benchmark dataset to publication-ready chart;
- external contributions that pass the non-duplication gate.

## Non-goals

- claiming that demo scores are current model results;
- copying vendor logos or copyrighted publication artwork;
- ranking models with incompatible evaluation protocols;
- adding visual variants whose only difference is color or theme.
