# PlantUML Diagrams - Usage Guide

## Overview

This package contains 4 PlantUML diagrams for the Mekong Capital Investment Intelligence Platform. PlantUML allows you to generate high-quality diagrams from text-based descriptions.

## Files Included

1. **system_architecture.plantuml**
   - Type: Component Diagram
   - Shows: Complete 5-layer architecture with all Microsoft AI ecosystem components
   - Best for: Technical architecture presentations, developer onboarding

2. **deployment_architecture.plantuml**
   - Type: Deployment Diagram (Simplified)
   - Shows: Azure resources, M365 services, data flow with sequence numbers
   - Best for: Infrastructure planning, DevOps team, Azure architects

3. **workflow_sequence.plantuml**
   - Type: Sequence Diagram
   - Shows: End-to-end investment analysis workflow from document upload to AI recommendation
   - Best for: Process documentation, stakeholder demos, user training

4. **dataverse_entity_model.plantuml**
   - Type: Class/Entity-Relationship Diagram
   - Shows: Complete Dataverse data model with all entities, fields, and relationships
   - Best for: Database design, data migration planning, Power Apps developers

## How to Generate Diagrams

### Option 1: Online PlantUML Server (Easiest)

1. Go to http://www.plantuml.com/plantuml/uml/
2. Copy the content of any .plantuml file
3. Paste into the text area
4. Click "Submit" to generate the diagram
5. Download as PNG, SVG, or PDF

### Option 2: PlantUML VS Code Extension (Recommended for Development)

1. Install VS Code extension: "PlantUML" by jebbs
2. Open any .plantuml file in VS Code
3. Press `Alt+D` (Windows/Linux) or `Option+D` (Mac) to preview
4. Right-click on preview → "Export Current Diagram"
5. Choose format: PNG, SVG, PDF, etc.

**Extension link:** https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml

### Option 3: Local PlantUML Installation

**Requirements:**
- Java Runtime Environment (JRE) 8 or higher
- Graphviz (for some diagram types)

**Installation:**

```bash
# macOS
brew install plantuml
brew install graphviz

# Ubuntu/Debian
sudo apt-get install plantuml graphviz

# Windows (with Chocolatey)
choco install plantuml
choco install graphviz
```

**Generate diagrams:**

```bash
# Generate PNG
plantuml system_architecture.plantuml

# Generate SVG (vector, scalable)
plantuml -tsvg system_architecture.plantuml

# Generate PDF
plantuml -tpdf system_architecture.plantuml

# Generate all diagrams in current directory
plantuml *.plantuml
```

### Option 4: Online Editors with Live Preview

**PlantText:** https://www.planttext.com/
- Simple, clean interface
- Live preview
- Export to PNG

**PlantUML QEditor:** https://github.com/borisbat/plantuml-qeditor
- Desktop application
- Syntax highlighting
- Multiple export formats

## Customization Tips

### Change Colors

Each diagram uses color definitions. Modify these at the top of the file:

```plantuml
!define AZURE_COLOR #0078D4
!define M365_COLOR #7719AA
!define AI_COLOR #FF6F00
```

### Change Theme

Replace the theme line:

```plantuml
!theme cerulean-outline
```

Available themes: cerulean, vibrant, aws-orange, bluegray, etc.
See full list: https://plantuml.com/theme

### Add/Remove Components

Simply edit the text to add or remove components:

```plantuml
component "New Service" as NewSvc #COLOR
NewSvc --> ExistingService : "relationship"
```

### Adjust Layout

Use `skinparam linetype ortho` for orthogonal (right-angle) lines:

```plantuml
skinparam linetype ortho
```

Or use `polyline` for flexible curved lines.

## Export Formats

PlantUML supports multiple output formats:

| Format | Use Case | Command |
|--------|----------|---------|
| **PNG** | General purpose, presentations | `-tpng` |
| **SVG** | Vector graphics, scalable | `-tsvg` |
| **PDF** | Documents, printing | `-tpdf` |
| **EPS** | Publishing | `-teps` |
| **LaTeX** | Academic papers | `-tlatex` |

## Best Practices

### For Presentations
- Export as **SVG** for crisp display at any resolution
- Use light themes for projectors
- Simplify complex diagrams (remove details)

### For Documentation
- Export as **PNG** (high DPI: 300+)
- Include legends and notes
- Version control the .plantuml source files

### For Collaboration
- Store .plantuml files in Git
- Review changes via text diff
- Generate diagrams in CI/CD pipeline

## Diagram-Specific Notes

### System Architecture
- **Complexity:** High (30+ components)
- **Render time:** ~5 seconds
- **Recommended format:** SVG or PDF
- **Print size:** A3 landscape

### Deployment Architecture
- **Complexity:** Medium
- **Render time:** ~3 seconds
- **Recommended format:** PNG or SVG
- **Print size:** A4 landscape

### Workflow Sequence
- **Complexity:** High (sequence with groups)
- **Render time:** ~8 seconds
- **Recommended format:** SVG (for long diagram)
- **Print size:** A3 portrait or A2

### Dataverse Entity Model
- **Complexity:** Very High (12 entities × 30+ fields)
- **Render time:** ~10 seconds
- **Recommended format:** PDF or SVG
- **Print size:** A2 landscape

## Troubleshooting

### Error: "Cannot read diagram"
- Check syntax (missing closing brackets, quotes)
- Verify PlantUML installation
- Try online server to isolate issue

### Diagram looks cluttered
- Use `skinparam linetype ortho`
- Adjust layout direction: `left to right direction`
- Hide some relationships temporarily

### Slow rendering
- Split into multiple diagrams
- Remove detailed notes
- Simplify entity fields (show key fields only)

### Colors not showing
- Ensure theme is loaded: `!theme <name>`
- Check color definitions (hex codes)
- Try default theme (remove theme line)

## Advanced Features

### Include External Files

```plantuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml
```

### Conditional Rendering

```plantuml
!if %getenv("DETAILED") == "true"
  ' Show detailed view
!else
  ' Show simplified view
!endif
```

### Macros for Reusable Components

```plantuml
!define AZURE_COMPONENT(name, label) component label as name #0078D4
AZURE_COMPONENT(oai, "Azure OpenAI")
```

## Integration with Documentation

### Confluence
1. Install "PlantUML for Confluence" plugin
2. Use `{plantuml}` macro
3. Paste diagram code

### GitHub/GitLab
1. Store .plantuml files in repo
2. Use PlantUML Proxy for rendering:
   ```markdown
   ![Architecture](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/your-repo/system_architecture.plantuml)
   ```

### Notion
1. Export diagram as PNG
2. Upload as image block
3. Store .plantuml source in code block

### Microsoft Teams
1. Export as PNG/SVG
2. Upload to Teams channel or SharePoint
3. Reference in Teams Wiki

## Resources

- **Official Documentation:** https://plantuml.com/
- **Cheat Sheet:** https://plantuml.com/guide
- **Gallery:** https://real-world-plantuml.com/
- **Forum:** https://forum.plantuml.net/
- **GitHub:** https://github.com/plantuml/plantuml

## Contact

For questions about these specific diagrams:
- Architecture questions → Solution Architect
- Data model questions → Dataverse Team
- Workflow questions → Business Analyst

---

**Version:** 1.0  
**Last Updated:** February 2026  
**Maintained by:** Mekong Capital IIP Project Team
