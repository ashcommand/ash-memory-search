---
name: Bug Report
description: Report a bug to help us improve
title: '[BUG] '
labels: ['bug']
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to report a bug! Please fill out this form completely.
  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear description of what the bug is
      placeholder: What went wrong?
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Run '...'
        3. See error
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What you expected to happen
      placeholder: What should have happened?
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior
      description: What actually happened
      placeholder: What actually happened?
    validations:
      required: true
  - type: input
    id: version
    attributes:
      label: Version
      description: What version are you running?
      placeholder: e.g., v1.0.0
    validations:
      required: true
  - type: dropdown
    id: os
    attributes:
      label: Operating System
      description: What OS are you using?
      options:
        - macOS
        - Linux
        - Windows
        - Other
    validations:
      required: true
  - type: textarea
    id: logs
    attributes:
      label: Logs/Error Messages
      description: Any relevant logs or error messages
      render: shell
  - type: textarea
    id: context
    attributes:
      label: Additional Context
      description: Any other context about the problem
  - type: checkboxes
    id: terms
    attributes:
      label: Checklist
      options:
        - label: I have searched existing issues
          required: true
        - label: I can reproduce this bug
          required: true
