---
layout: home
titleTemplate: Token-Oriented Object Notation
hero:
  name: TOON
  text: Token-Oriented Object Notation
  tagline: A compact, human-readable encoding of the JSON data model for LLM prompts.
  image:
    dark: /logo-index-dark.svg
    light: /logo-index-light.svg
    alt: TOON Logo
  actions:
    - theme: brand
      text: What is TOON?
      link: /guide/getting-started
    - theme: alt
      text: New in v4
      link: /guide/whats-new-in-v4
    - theme: alt
      text: Benchmarks
      link: /guide/benchmarks
    - theme: alt
      text: Playground
      link: /playground
    - theme: alt
      text: CLI
      link: /cli/

features:
  - title: Token-Efficient & Accurate
    icon: 📊
    details: TOON reaches 72.2% accuracy (vs JSON's 71.4%) while using 42.6% fewer tokens across 244 retrieval questions on 4 models.
    link: /guide/benchmarks
  - title: JSON Data Model
    icon: 🔁
    details: Encodes the same objects, arrays, and primitives as JSON with deterministic, lossless round-trips.
    link: /guide/format-overview
  - title: LLM-Friendly Guardrails
    icon: 🛤️
    details: Array headers declare their length and tabular headers their field list, giving models fixed row widths and making truncated output detectable.
    link: /guide/format-overview#array-headers
  - title: Minimal Syntax
    icon: 📐
    details: Uses indentation instead of braces and minimizes quoting, giving YAML-like readability with CSV-style compactness.
    link: /guide/format-overview#quoting-and-types
  - title: Tabular Forms
    icon: 🧺
    details: Arrays of uniform objects – and objects of uniform objects – declare the field list once in the header, then stream the values one row per line.
    link: /guide/format-overview#the-four-forms
  - title: Multi-Language Ecosystem
    icon: 🌐
    details: Official implementations, plus dozens of community ports, all built on one spec and a shared test suite.
    link: /ecosystem/implementations
---
