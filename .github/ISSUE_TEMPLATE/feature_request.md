---
name: Feature Request
description: Suggest an idea for this project
title: '[FEATURE] '
labels: ['enhancement']
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        Thanks for suggesting a feature! Please fill out this form completely.
  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: What problem are you trying to solve?
      placeholder: I'm always frustrated when...
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: What solution would you like to see?
      placeholder: I would like...
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: What alternatives have you considered?
      placeholder: I've also thought about...
  - type: dropdown
    id: priority
    attributes:
      label: Priority
      description: How important is this feature to you?
      options:
        - Nice to have
        - Important
        - Critical
        - Blocker
    validations:
      required: true
  - type: checkboxes
    id: willing
    attributes:
      label: Contribution
      options:
        - label: I'm willing to implement this feature
        - label: I can help test this feature
        - label: I can provide guidance
  - type: textarea
    id: context
    attributes:
      label: Additional Context
      description: Any other context or screenshots
  - type: checkboxes
    id: terms
    attributes:
      label: Checklist
      options:
        - label: I have searched existing issues
          required: true
        - label: This feature hasn't been requested before
          required: true
