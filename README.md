# AI Dev Hub

# Build a Full AI Development Platform — Web + Real Desktop Application

Build a complete, production-quality AI development platform that combines the best workflow concepts from **Cursor, VS Code, Claude Code, OpenAI Codex, ChatGPT, Devin, Lovable, and other modern AI coding agents**, while having its own unique identity and UI.

This is NOT supposed to be a simple AI chat website.

I want a serious **AI operating environment for software development, game development, website creation, automation, debugging, design, and general computer work**.

The final product should feel like a combination of:

* Cursor
* VS Code
* Claude Code
* OpenAI Codex
* ChatGPT
* Devin
* Lovable
* An AI agent workspace
* A modern IDE
* A computer-use agent

The application should have both:

1. A polished web application
2. A REAL desktop application that installs and runs as an actual application on Windows/macOS/Linux where practical

The desktop application must NOT simply be a website wrapped in a browser window or a fake shortcut to the website. It should have a proper desktop architecture capable of interacting with the local computer, local filesystem, development tools, terminals, projects, and integrations.

---

# 1. PRODUCT VISION

Create an AI development environment where the user can open a project and tell the AI things such as:

> "Build me a Roblox FPS game."

> "Fix this Lua error."

> "Open my project and figure out why the UI isn't loading."

> "Build me a website for my business."

> "Create a React application."

> "Look at this screenshot and recreate the interface."

> "Connect to my Roblox Studio project."

> "Modify the files in this folder."

> "Run the project and test it."

> "Find the bug and fix it."

> "Plan the entire application before changing anything."

> "Build the UI first."

> "Make this system more optimized."

> "Look at these images and tell me what needs to change."

The AI should be able to plan, reason, inspect files, write code, edit code, create files, delete files when authorized, execute commands, inspect results, iterate, test, debug, and report what it is doing.

The goal is:

**User describes the goal → AI understands the project → AI plans → AI asks necessary questions → AI executes → AI tests → AI fixes problems → AI reports completion.**

---

# 2. IMPORTANT — DO NOT REQUIRE THE USER TO PROVIDE API KEYS

I do NOT want the product to be designed around requiring me to manually enter a bunch of API keys.

Do not make the core experience:

> "Enter OpenAI API Key"

> "Enter Anthropic API Key"

> "Enter some random provider key"

Instead, design the application around a **provider/model abstraction layer**.

The UI should have a model system that can support different AI models behind the scenes.

Create a model/provider architecture that allows models to be added later without rebuilding the entire application.

The user should be able to select models from the application's model selector.

Examples:

* Fast
* Balanced
* Smart
* Thinking
* Extreme
* Ultra
* Coding
* Agent
* Vision
* Image
* Web Research

The actual backend/provider implementation should be modular.

DO NOT hard-code the entire application around one AI provider.

---

# 3. AUTHENTICATION

Create a complete authentication system.

Users should be able to:

* Create an account
* Sign in
* Sign out
* Reset password
* Change password
* Verify email
* Maintain a profile
* Manage account settings
* Manage sessions
* View connected devices
* Delete their account

Primary authentication:

* Email + password

Also structure the system so OAuth providers can be added later.

Possible future providers:

* Google
* GitHub
* Discord
* Microsoft
* Apple

Do not require all of these immediately if backend configuration is unavailable, but architect the application so they can be added.

---

# 4. PERSISTENT CHAT SYSTEM

Chats MUST save.

If a user closes the application and returns later, their conversations should still exist.

Create a complete chat/project history system.

Each conversation should have:

* Title
* Creation date
* Last modified date
* Project association
* Model used
* Mode used
* Agent status
* Files modified
* Commands executed
* Tool usage history
* Images
* Attachments
* Generated artifacts

Sidebar sections:

## Recent

Show recent conversations.

## Projects

Show project-specific conversations.

## Favorites

Allow users to favorite chats.

## Archived

Allow chats to be archived.

## Search

Search across:

* Chat titles
* Messages
* Projects
* Files
* Code
* Conversation content

Allow users to rename chats.

Allow users to delete chats.

Allow users to duplicate conversations.

Allow users to export conversations.

---

# 5. MAIN APPLICATION LAYOUT

The UI should feel heavily inspired by:

* VS Code
* Cursor
* Devin
* modern IDEs

BUT DO NOT DIRECTLY COPY THEIR BRANDING.

Use an original design.

The overall layout should have:

### LEFT SIDEBAR

Contains:

* New Chat
* Explorer
* Projects
* Chats
* Extensions
* Agents
* Models
* Git
* Search
* Settings

### MAIN WORKSPACE

The central area should contain:

* Chat
* Code editor
* Diff viewer
* Terminal
* Browser preview
* Agent activity
* Plan
* Files
* Images
* Debugging information

### RIGHT SIDEBAR

Contextual panel containing:

* Agent activity
* Files changed
* Plan
* Errors
* Terminal output
* Preview
* AI reasoning/status summary
* Tool activity

Panels should be resizable.

Allow users to hide/show panels.

Allow drag-and-drop panel rearrangement where practical.

---

# 6. EXPLORER

Create a powerful Explorer similar to an IDE file explorer.

It should show:

* Projects
* Workspaces
* Files
* Folders
* Git repositories
* Connected environments
* Roblox projects
* Website projects
* Game projects

Actions:

* New file
* New folder
* Rename
* Delete
* Duplicate
* Move
* Copy
* Paste
* Open
* Search
* Reveal in system file explorer
* Open terminal here

The Explorer should understand project structures.

Examples:

### Roblox

* src
* server
* client
* shared
* assets
* project.json

### React

* src
* public
* package.json
* components
* pages

### Python

* requirements.txt
* pyproject.toml
* src
* tests

### Node

* package.json
* node_modules
* src

---

# 7. FULL LOCAL COMPUTER ACCESS — DESKTOP APP

The desktop application should have an explicit **Local Computer / Workspace Access** system.

The user should be able to grant the application access to:

* Desktop
* Documents
* Downloads
* Pictures
* Videos
* Development folders
* Custom folders
* External drives when permitted

Do NOT silently access files.

Create a permissions system.

For example:

## Computer Access

OFF

[Grant Folder Access]

Once granted, show:

> Access granted to:
> C:\Users\User\Projects

Allow users to revoke access.

The application should be capable of:

* Reading files
* Creating files
* Editing files
* Renaming files
* Moving files
* Deleting files
* Creating folders
* Running commands
* Running development servers
* Reading terminal output
* Inspecting logs

Destructive operations should support confirmation settings.

Settings:

### File Modification Permissions

* Ask every time
* Ask for destructive operations
* Allow automatically
* Restricted mode

### Terminal Permissions

* Ask before commands
* Allow safe commands
* Allow automatically
* Restricted

---

# 8. REAL DESKTOP APPLICATION

Build the desktop application as a real native-capable application architecture.

Preferred approach:

* Electron or Tauri
* Local backend/bridge
* Secure IPC
* Sandboxed renderer
* Native filesystem APIs
* Terminal integration

The application should have:

* Native application window
* Native menus
* File system integration
* Terminal integration
* System notifications
* Clipboard support
* Drag-and-drop
* Open-with integration where possible
* Deep links
* Local workspace access
* Auto-update architecture

Do NOT make the desktop application merely iframe the website.

The desktop app should have a local agent bridge capable of communicating with the UI.

---

# 9. AGENT MODE

Create a major **Agent Mode**.

Agent Mode should be autonomous.

The AI can:

1. Understand the request
2. Inspect the workspace
3. Inspect relevant files
4. Create a plan
5. Modify files
6. Run commands
7. Run tests
8. Inspect errors
9. Fix errors
10. Repeat
11. Verify completion
12. Give a final summary

Agent Mode should display live activity.

Example:

### Agent Activity

🧠 Analyzing project

✓ Workspace detected

✓ Found package.json

✓ Found src directory

🔎 Searching for authentication implementation

✓ Found auth.ts

✏️ Editing auth.ts

▶ Running tests

⚠ Test failed

🔧 Fixing authentication error

▶ Running tests again

✓ All tests passed

This activity should update in real time.

---

# 10. PLAN MODE

Create a separate **Plan Mode**.

Plan Mode should NOT immediately modify files.

It should investigate and create a detailed implementation plan.

Example:

### PLAN

Goal:
Build an inventory system.

1. Inspect current inventory code
2. Identify existing data structures
3. Design inventory state
4. Create item schema
5. Create inventory UI
6. Connect UI to state
7. Add persistence
8. Add testing
9. Run tests
10. Verify functionality

Then provide buttons:

[Start Implementation]

[Edit Plan]

[Cancel]

Allow the user to edit the plan before execution.

---

# 11. MULTIPLE AGENT SPEED / INTELLIGENCE MODES

Create an Agent Performance selector.

Modes:

### Lite

Fast and inexpensive.

Good for:

* Small edits
* Simple questions
* Renaming
* Small bugs

### Super Fast

Prioritize speed.

Good for:

* Quick coding
* Simple fixes
* Short tasks

### Balanced

Default mode.

Balances speed and intelligence.

### Extreme

Maximum autonomous effort.

Good for:

* Large projects
* Complex debugging
* Large refactors

### Ultra

Maximum intelligence and planning.

Good for:

* Huge projects
* Architecture
* Complex development

### Deep Thinking

Extra reasoning effort.

### Web Research

Allows the agent to research information online before acting.

### Vision

Optimized for image/screenshot understanding.

### Coding

Optimized for programming.

### Creative

Optimized for design, writing, UI, assets, and creative tasks.

---

# 12. SPECIALIZED MODES

Inside Explorer/Agents, create a section called:

# Development Modes

Include MANY specialized modes.

## General Agent

General computer/software agent.

## UI Designer

Specialized in:

* UI
* UX
* CSS
* layouts
* responsive design
* component systems
* visual consistency

## Website Builder

Specialized in:

* React
* Next.js
* HTML
* CSS
* JavaScript
* TypeScript
* backend integration
* deployment

## Full Stack Developer

Handles:

* frontend
* backend
* databases
* APIs
* authentication
* testing

## System Builder

Build operating systems/services/tools/automation systems.

## Game Developer

General game development.

## Roblox Developer

Specialized in:

* Roblox Studio
* Luau
* RemoteEvents
* RemoteFunctions
* UI
* replication
* server/client architecture
* optimization
* Roblox APIs
* Rojo
* Wally
* Roblox project structures

## Roblox UI Developer

Specialized in Roblox interfaces.

## Roblox Systems Developer

Specialized in:

* inventory
* combat
* weapons
* quests
* progression
* shops
* data systems
* matchmaking

## Minecraft Developer

Specialized Minecraft development.

## Unity Developer

Specialized Unity development.

## Unreal Developer

Specialized Unreal development.

## Python Developer

## JavaScript Developer

## TypeScript Developer

## C# Developer

## C++ Developer

## Lua/Luau Developer

## Web Research Agent

Searches the web and gathers documentation.

## Debugger

Specialized in identifying and fixing bugs.

## Code Reviewer

Reviews code without changing it unless instructed.

## Security Reviewer

Identifies security problems.

## Performance Engineer

Finds bottlenecks and optimizes applications.

## Database Engineer

Handles:

* SQL
* schema
* queries
* migrations
* optimization

## DevOps Agent

Handles:

* Git
* CI/CD
* Docker
* deployments
* environments

## Designer

Creates visual concepts and assets.

## Image Agent

Understands images and creates images where supported.

## Documentation Agent

Creates documentation.

---

# 13. MODE CREATOR

Allow users to create their OWN modes.

Button:

[+ Create Mode]

User enters:

Name:

Description:

Instructions:

Preferred model:

Tools:

Permissions:

Project types:

Example:

> "Create a FiveM Lua Developer mode specialized in vehicle resources."

Then save it.

Custom modes should appear under:

## My Modes

Users should be able to:

* Edit
* Duplicate
* Disable
* Delete
* Export
* Import

---

# 14. QUESTION / CLARIFICATION SYSTEM

The agent should know when it needs information.

If it cannot safely or correctly proceed, it can ask the user questions.

Example:

> I found three inventory systems. Which one should I modify?

Options:

[InventoryService]

[InventoryController]

[All of them]

But the user should also be able to configure:

### Question Behavior

* Always ask
* Ask only when necessary
* Ask before major changes
* Never ask unless blocked

Create a visual question interface.

---

# 15. "SHOW ME WHAT YOU'RE DOING"

The user should always be able to see agent activity.

Create a live Agent Timeline.

Example:

### Agent Timeline

10:41:03 — Started task

10:41:05 — Inspecting workspace

10:41:07 — Reading package.json

10:41:10 — Searching source files

10:41:14 — Found authentication system

10:41:19 — Creating implementation plan

10:41:26 — Editing auth.ts

10:41:30 — Running npm test

10:41:35 — Test failed

10:41:39 — Diagnosing failure

10:41:45 — Applying fix

10:41:52 — Test passed

Allow users to expand each event.

For example:

> Editing auth.ts

Clicking it opens the diff.

---

# 16. CODE EDITOR

Include a serious code editor.

It should support:

* Syntax highlighting
* Tabs
* Multiple files
* Search
* Replace
* Multi-cursor
* Autocomplete
* Code folding
* Minimap
* Line numbers
* Error indicators
* Diagnostics
* Formatting
* Go to definition
* Find references
* Rename symbol
* Command palette
* Keyboard shortcuts

Use a professional editor architecture such as Monaco where appropriate.

---

# 17. AI CODE EDITING

The AI should be able to:

* Edit selected code
* Explain code
* Refactor
* Fix bugs
* Generate code
* Generate tests
* Optimize
* Add comments
* Generate documentation

Selection actions:

### Ask AI

* Explain
* Fix
* Refactor
* Optimize
* Add tests
* Improve
* Rewrite
* Generate documentation

---

# 18. DIFF SYSTEM

Every AI modification should support a diff.

Example:

### Changed: player.lua

* added new function

- removed old function

Show:

[Accept]

[Reject]

[Open File]

For larger agent tasks:

### Review All Changes

File | Changes | Status

player.lua | +42 -13 | Pending

inventory.lua | +80 -4 | Pending

ui.lua | +31 -8 | Pending

Buttons:

[Accept All]

[Reject All]

[Review Individually]

---

# 19. TERMINAL

The desktop application needs a real integrated terminal.

Features:

* Multiple terminals
* Shell selection
* PowerShell
* CMD
* Bash
* Zsh where available
* Terminal tabs
* Kill process
* Restart terminal
* Copy output
* Clear terminal
* Search output

The AI agent should be able to use the terminal according to permissions.

Example:

```text
PS C:\Projects\MyGame>
```

Agent can run:

* npm
* git
* python
* cargo
* rojo
* roblox-related tools
* build tools
* test tools

---

# 20. GIT

Build Git integration.

Features:

* Git status
* Changed files
* Diff
* Commit
* Branches
* Checkout
* Pull
* Push
* Merge
* Rebase where supported
* Stash
* History

AI should be able to explain Git changes.

Add:

### AI Commit Message

The agent analyzes changes and generates a commit message.

---

# 21. ROBLOX STUDIO INTEGRATION

This is extremely important.

Create a dedicated Roblox integration system.

The platform should support connecting to Roblox Studio through methods such as:

* Rojo
* Roblox Studio plugin
* MCP server / MCP-style bridge
* Local development server
* Project synchronization

Design the architecture so different connection methods can be supported.

Create:

# Roblox Studio Connection

Status:

🔴 Not Connected

[Connect Roblox Studio]

Connection methods:

### Rojo

[Configure Rojo]

### Roblox Studio Plugin

[Connect Plugin]

### MCP / Local Bridge

[Configure Connection]

Once connected:

🟢 Roblox Studio Connected

Show:

* Current place/project
* Connected experience
* Server/client status
* Studio status
* Synced files
* Current selection if available
* Output logs

---

# 22. ROBLOX MCP / BRIDGE CAPABILITIES

If connected to a Roblox Studio bridge/MCP server, the AI should be able to interact with Roblox Studio according to granted permissions.

Potential capabilities:

* Read instances
* Inspect hierarchy
* Read scripts
* Edit scripts
* Create scripts
* Delete scripts
* Rename instances
* Create folders
* Inspect properties
* Modify properties
* Read output
* Detect errors
* Run/test workflows where supported
* Inspect selected objects
* Generate UI
* Generate game systems

Example:

User:

> "Fix the gun system."

AI:

1. Connects to Roblox Studio
2. Inspects relevant scripts
3. Reads output errors
4. Identifies issue
5. Edits source
6. Syncs changes
7. Tests
8. Checks output
9. Reports result

---

# 23. ROJO SUPPORT

Create a Rojo workspace configuration interface.

Allow users to select:

* Rojo project file
* Source folder
* Roblox place
* Sync status

Display:

🟢 Rojo Connected

Files:

src/client

src/server

src/shared

The AI should understand Rojo project structures.

---

# 24. EXTENSION MARKETPLACE

Create an Extensions system similar conceptually to VS Code/Cursor.

Sidebar:

# Extensions

Categories:

* AI
* Roblox
* Web
* Python
* JavaScript
* Game Development
* Git
* Databases
* DevOps
* Productivity
* Themes
* Tools

Each extension has:

* Icon
* Name
* Author
* Description
* Version
* Install button
* Enable/disable
* Settings
* Permissions

---

# 25. CUSTOM EXTENSIONS

Allow developers to create extensions.

Create an extension API architecture.

Extensions should be able to register:

* Commands
* Panels
* Menus
* Agent tools
* File providers
* Language support
* Project detectors
* Integrations

Eventually users should be able to build their own tools.

---

# 26. MCP SUPPORT

Build an MCP-compatible integration architecture.

Create:

# Tools & Integrations

Users should be able to connect external tools.

Examples:

* Roblox Studio
* GitHub
* GitLab
* Local filesystem
* Database
* Browser
* Terminal
* Docker
* Custom MCP server

Each tool should have permissions.

Example:

### Roblox MCP

Permissions:

☑ Read project

☑ Read scripts

☑ Edit scripts

☐ Delete instances

☑ Read output

☑ Modify properties

---

# 27. TOOL PERMISSIONS

Create a detailed permission system.

Each agent tool should have permissions.

Examples:

### Files

Read

Write

Delete

Rename

### Terminal

Read

Execute

Kill process

### Browser

Read pages

Search web

Interact with pages

### Roblox

Read

Write

Create

Delete

Run/test

### Git

Read

Commit

Push

Branch

The user can configure permissions globally or per project.

---

# 28. WEB SEARCH

Add a Web Search capability.

The AI should be able to:

* Search the internet
* Read documentation
* Search GitHub
* Search Stack Overflow
* Search official documentation
* Research libraries
* Compare solutions

When Web Search mode is active, display:

### Research

Searching...

Sources found:

1. Official documentation
2. GitHub
3. Documentation
4. Community discussion

The AI should cite sources when appropriate.

---

# 29. VISION / IMAGE UNDERSTANDING

The platform should support images.

Users can:

* Upload screenshots
* Drag images into chat
* Paste screenshots
* Upload UI designs
* Upload error screenshots
* Upload game screenshots

The AI should be able to analyze them.

Examples:

> "What is wrong with this UI?"

> "Recreate this design."

> "Find the issue in this screenshot."

> "Tell me what Roblox Studio error this shows."

---

# 30. IMAGE GENERATION

Create an Image Agent.

It should support creating visual assets where the connected model/provider supports image generation.

Examples:

* UI mockups
* Game icons
* Roblox thumbnails
* Website graphics
* Logos
* Backgrounds
* Concept art
* Textures
* Design references

Generated images should appear in the conversation and be saved to the project when the user chooses.

Buttons:

[Save to Project]

[Regenerate]

[Edit]

[Download]

---

# 31. PROJECT SYSTEM

Create a first-class Project system.

A Project contains:

* Files
* Chats
* Agent history
* Settings
* Model preferences
* Environment variables
* Integrations
* Git information
* Extension settings
* Agent permissions

Example:

# My Roblox FPS

Files

Chats

Agents

Extensions

Git

Settings

Integrations

---

# 32. PROJECT MEMORY

Each project should have project-level context.

The AI should remember:

* Project architecture
* Important files
* User preferences for that project
* Coding conventions
* Existing systems
* Important decisions

Create:

### Project Instructions

Example:

> This is a Roblox FPS.
> Use Luau.
> Server-authoritative combat.
> Do not modify the weapon framework without asking.
> Use existing UI components.

Allow users to edit these instructions.

---

# 33. GLOBAL AI MEMORY

Create optional user-level AI preferences.

Examples:

* Preferred coding style
* Preferred language
* Preferred framework
* Preferred response length
* Preferred agent behavior

Include controls for privacy and memory.

---

# 34. AI MODEL SELECTOR

Create a polished model selector at the top of the chat.

Example:

### Model

Smart Agent

Dropdown:

* Fast
* Balanced
* Thinking
* Extreme
* Ultra
* Coding
* Vision
* Image
* Research

Show small descriptions.

Example:

**Ultra**

Maximum reasoning and autonomous development.

---

# 35. AGENT CONTROL BAR

At the bottom of the chat, create a sophisticated input area.

Buttons:

📎 Attach

🖼 Image

📁 Files

🌐 Web

🧠 Thinking

🤖 Agent

⚡ Speed

🔧 Tools

Send

Also support:

* Drag files
* Paste screenshots
* @ file mentions
* @ folders
* @ project
* Slash commands

---

# 36. SLASH COMMANDS

Support commands such as:

/plan

/agent

/fix

/test

/explain

/refactor

/review

/search

/build

/debug

/roblox

/web

/image

/git

---

# 37. COMMAND PALETTE

Add a command palette similar to professional IDEs.

Shortcut:

Ctrl + Shift + P

Commands:

* Open Project
* New Chat
* Start Agent
* Create Plan
* Open Terminal
* Connect Roblox Studio
* Run Tests
* Git Commit
* Search Files
* Open Settings
* Install Extension
* Create Mode

---

# 38. KEYBOARD SHORTCUTS

Support customizable shortcuts.

Examples:

Ctrl + P → Quick Open

Ctrl + Shift + P → Command Palette

Ctrl + ` → Terminal

Ctrl + Shift + F → Search

Ctrl + B → Sidebar

Ctrl + J → Panel

Ctrl + Enter → Send

Allow users to customize shortcuts.

---

# 39. SETTINGS

Create a huge professional settings system.

Categories:

## General

* Theme
* Language
* Startup behavior
* Confirmations

## Appearance

* Dark
* Light
* System
* Custom themes
* Font
* Font size
* UI density
* Animations

## Editor

* Font
* Tab size
* Word wrap
* Minimap
* Line numbers
* Auto-save
* Formatting
* IntelliSense

## AI

* Default model
* Default agent mode
* Thinking behavior
* Response style
* Context length
* Auto-run
* Planning behavior

## Agent

* Autonomy
* Maximum iterations
* Ask questions
* Tool permissions
* Terminal permissions
* File permissions
* Confirmation behavior

## Files

* Workspace access
* Auto-save
* File watching
* Ignore patterns

## Terminal

* Default shell
* Font
* Startup directory
* Environment

## Git

* Git integration
* Auto fetch
* Commit settings

## Web

* Search behavior
* Browser settings
* Research depth

## Roblox

* Rojo
* Studio bridge
* MCP
* Project path
* Sync behavior

## Extensions

* Marketplace
* Auto updates
* Extension permissions

## Privacy

* Data controls
* Memory
* Logs
* Telemetry
* Delete data

## Account

* Profile
* Password
* Sessions
* Connected services

---

# 40. THEMES

Create a theme system.

Include several professional themes:

* Dark
* Light
* Midnight
* Black
* High Contrast

Allow custom theme creation.

Theme settings should affect:

* Editor
* Sidebar
* Buttons
* Panels
* Code editor
* Chat
* Terminal

---

# 41. FILE CONTEXT

The AI should understand files when referenced.

Example:

User:

> Fix @player.lua

The UI should display:

@player.lua

The AI receives the file context.

Support:

@file

@folder

@project

@selection

@terminal

@errors

---

# 42. AUTOMATIC PROJECT DETECTION

When opening a folder, detect the project type.

Examples:

package.json → Node/Web

requirements.txt → Python

project.json → Roblox/Rojo

Cargo.toml → Rust

.csproj → C#

.sln → .NET

CMakeLists.txt → C++

Unity project → Unity

Unreal project → Unreal

Then suggest the appropriate Development Mode.

Example:

> Roblox project detected.

[Use Roblox Developer Mode]

---

# 43. LIVE PREVIEW

For website projects, create an integrated preview panel.

Features:

* Start dev server
* Preview website
* Refresh
* Open browser
* Mobile preview
* Desktop preview
* Inspect errors

AI should be able to see preview errors.

Potential workflow:

AI edits website → starts server → opens preview → detects UI issue → edits code → refreshes → checks again.

---

# 44. BROWSER AGENT

Create a browser-capable agent architecture.

The agent should eventually be able to:

* Open websites
* Search
* Navigate
* Inspect pages
* Test web applications
* Click elements
* Fill forms where authorized
* Read console errors
* Take screenshots

The user should be able to see browser activity.

---

# 45. DEBUGGING WORKFLOW

Create a dedicated debugger experience.

When an error happens:

### Error Detected

File:

player.lua

Line:

142

Error:

attempt to index nil

Buttons:

[Fix Automatically]

[Explain]

[Inspect]

The agent can investigate and apply a fix.

---

# 46. MULTI-AGENT SYSTEM

Support multiple specialized agents working together.

Example:

### Lead Agent

Coordinates the task.

### UI Agent

Builds UI.

### Backend Agent

Builds backend.

### Testing Agent

Runs tests.

### Reviewer Agent

Reviews work.

Workflow:

Lead Agent → UI Agent → Backend Agent → Testing Agent → Reviewer

Show this visually.

---

# 47. AGENT TASK QUEUE

Create task management.

Example:

### Current Task

Build inventory

Subtasks:

✓ Analyze project

✓ Design architecture

✓ Create inventory service

🔄 Build UI

○ Add persistence

○ Test

○ Review

Allow users to pause/resume/cancel.

---

# 48. PAUSE / STOP AGENT

Always provide:

[Pause]

[Stop]

[Continue]

If the agent is executing commands, stopping should safely terminate where possible.

---

# 49. ACTIVITY LOG

Create a detailed activity log.

Categories:

* File
* Terminal
* Browser
* Roblox
* Git
* Search
* AI
* Image
* Extension

Users can filter the activity log.

---

# 50. NOTIFICATIONS

Desktop notifications for:

* Agent completed
* Agent blocked
* Agent needs input
* Build failed
* Tests passed
* Roblox connection lost
* Task requires approval

---

# 51. PROJECT SNAPSHOTS

Before large agent modifications, optionally create a snapshot.

Example:

### Snapshot

Before AI changes

[Restore]

Allow restoring the project to a previous state.

---

# 52. UNDO / ROLLBACK

AI changes should be reversible.

Create:

* Undo last AI change
* Revert file
* Revert task
* Restore snapshot

---

# 53. ENVIRONMENT MANAGEMENT

Create environment configuration.

Support:

* Environment variables
* Development
* Testing
* Production

NEVER expose secrets unnecessarily in the UI or logs.

---

# 54. SECURITY

The desktop application has powerful permissions, so security needs to be taken seriously.

Implement:

* Permission prompts
* Sandboxing where possible
* Secure IPC
* Path validation
* Command validation
* Tool permissions
* Project isolation
* Secret protection
* Audit logs
* Confirmation dialogs for destructive actions

The AI should never silently perform dangerous/destructive operations when the user has configured confirmation requirements.

---

# 55. AGENT AUTONOMY SETTINGS

Create a slider or levels:

### Manual

AI suggests changes.

### Assisted

AI can edit but asks before important actions.

### Autonomous

AI can work independently within project permissions.

### Full Agent

AI can plan, execute, test, and iterate with minimal interruption.

Allow project-specific autonomy settings.

---

# 56. CONTEXT WINDOW / TOKEN DISPLAY

Show optional context information.

Example:

Context:

62%

Files:

18

Tokens:

42,300

Allow users to inspect what context is being used.

---

# 57. CHAT ARTIFACTS

AI responses can contain artifacts:

* Code
* Files
* Plans
* Images
* Documents
* Diffs
* Terminal output
* Tables

Artifacts should be interactive.

---

# 58. FILE GENERATION

The agent should be able to generate entire project structures.

Example:

User:

> Create a Roblox inventory system.

Agent generates:

src/

server/

InventoryService.luau

client/

InventoryController.luau

shared/

InventoryTypes.luau

UI/

InventoryGui.luau

Then show:

### Files Created

* InventoryService.luau

* InventoryController.luau

* InventoryTypes.luau

* InventoryGui.luau

---

# 59. CODEBASE SEARCH

Build extremely powerful project search.

Search:

* Files
* Symbols
* Functions
* Classes
* Variables
* Text
* Errors

Filters:

* File type
* Folder
* Project
* Language

---

# 60. AI CODEBASE UNDERSTANDING

The AI should be able to build an understanding of large codebases.

Create an indexing system.

Index:

* File structure
* Symbols
* Imports
* Dependencies
* References
* Documentation

This should improve agent performance on large projects.

---

# 61. PROJECT GRAPH

Create an optional visualization:

### Project Architecture

UI

↓

Controllers

↓

Services

↓

Database

Show relationships between files/modules.

For Roblox:

Client

↓

RemoteEvents

↓

Server

↓

DataStore

---

# 62. MOBILE / RESPONSIVE WEB

The website should work on:

* Desktop
* Tablet
* Mobile

However, the desktop application should provide the full professional IDE experience.

---

# 63. LANDING PAGE

Create a beautiful landing page.

Hero:

# Your AI Development Environment

Subtitle:

> Build software, websites, games, and systems with an autonomous AI developer that can understand your projects, edit your files, run your tools, and work alongside you.

Buttons:

[Start Building]

[Download Desktop App]

Sections:

* AI Agent
* Code Editor
* Plan Mode
* Roblox Development
* Web Development
* Extensions
* Desktop Integration
* Vision
* Web Research

---

# 64. DASHBOARD

After login:

# Welcome back

Recent projects.

Recent chats.

Agent activity.

Quick actions:

[New Project]

[Open Folder]

[New Chat]

[Start Agent]

[Connect Roblox Studio]

[Install Extension]

---

# 65. PROJECT CREATION

New Project wizard:

### Project Name

### Location

### Type

Options:

* Empty
* React
* Next.js
* Python
* Node
* Roblox
* FiveM
* Unity
* Unreal
* Custom

Then:

[Create Project]

---

# 66. ROBLOX PROJECT WIZARD

Dedicated Roblox project creation.

Options:

* Rojo
* Standard Studio workflow
* MCP/Studio bridge
* Existing project

Fields:

Project path

Rojo project

Studio connection

Development mode

---

# 67. FIVE-M / GAME DEVELOPMENT MODE

Include FiveM as a specialized development mode.

Support:

* Lua
* JS
* C#
* fxmanifest
* resources
* client/server/shared
* NUI
* vehicles
* scripts

The AI should understand FiveM resource architecture.

---

# 68. AI GENERATED UI

When the AI generates UI, show it visually.

For websites:

Code + live preview.

For Roblox:

UI hierarchy + scripts where integration permits.

For applications:

Component preview.

---

# 69. RESPONSE STYLE

AI should not always dump huge amounts of text.

Default responses should be concise when the task is straightforward.

When performing an agent task, prioritize:

* What I'm doing
* What changed
* Errors
* Results
* Next step

Example:

> I found the issue in `InventoryService.luau`. The server was not validating item ownership. I added server-side validation and ran the relevant tests successfully.

---

# 70. ERROR HANDLING

If a tool fails, the agent should not simply stop.

It should:

1. Understand error
2. Try alternative solution
3. Explain if blocked
4. Ask user only if necessary

Example:

> Roblox Studio connection failed. The local bridge is not responding.

[Retry]

[Connection Settings]

---

# 71. OFFLINE / LOCAL CAPABILITIES

The desktop app should continue providing local IDE functionality even if AI services are unavailable.

Users should still be able to:

* Browse files
* Edit code
* Use terminal
* Use Git
* Manage projects
* Configure integrations

Show AI connection status separately.

---

# 72. ARCHITECTURE

Use a clean modular architecture.

Suggested structure:

Frontend:

* React
* TypeScript
* modern component architecture

Desktop:

* Tauri or Electron

Editor:

* Monaco

Backend:

* Modular API/service architecture

Database:

* PostgreSQL or another production-ready database

Authentication:

* Secure authentication service

Realtime:

* WebSockets/SSE for agent activity

Local bridge:

* Native desktop service

AI layer:

* Provider abstraction

Tool layer:

* MCP-compatible architecture

Do not tightly couple everything together.

---

# 73. DATABASE STRUCTURE

Create database models for:

Users

Projects

Chats

Messages

Files metadata

Agent tasks

Agent events

Plans

Models

Providers

Extensions

Custom modes

Integrations

Permissions

Snapshots

Git information

User settings

Project settings

---

# 74. REALTIME AGENT EVENTS

Use realtime communication for agent status.

Events:

agent.started

agent.thinking

agent.tool_started

agent.tool_finished

agent.file_changed

agent.command_started

agent.command_finished

agent.error

agent.question

agent.paused

agent.completed

The frontend should update immediately.

---

# 75. AGENT TOOL ARCHITECTURE

Create a unified tool interface.

Tools could include:

filesystem.read

filesystem.write

filesystem.search

filesystem.delete

terminal.execute

terminal.read

git.status

git.diff

git.commit

browser.search

browser.open

browser.click

image.analyze

image.generate

roblox.inspect

roblox.edit

roblox.sync

mcp.call

project.search

project.index

The AI should interact with tools through a controlled tool layer.

---

# 76. TOOL ACTIVITY UI

Every tool action should appear visibly.

Example:

🔧 filesystem.read

`src/player.lua`

Completed

Then:

🔧 terminal.execute

`npm test`

Completed

Then:

🔧 filesystem.write

`src/player.ts`

Completed

---

# 77. CUSTOM AI TOOLS

Allow users to create custom tools eventually.

Example:

Tool Name:

Deploy My Game

Command:

...

Permissions:

...

Then the AI can invoke the tool when appropriate.

---

# 78. MODEL ROUTING

Create a model routing layer.

The application can choose models based on task.

Example:

Simple rename:

Fast model.

Complex architecture:

Thinking/Ultra model.

Image understanding:

Vision model.

Image generation:

Image model.

Web research:

Research model.

Coding:

Coding model.

Do not expose provider complexity to the user unless desired.

---

# 79. MODEL FALLBACK

If a selected model fails, support fallback logic.

Example:

Primary model unavailable.

↓

Try fallback model.

↓

Continue task if possible.

Show:

> Primary model unavailable. Switching to fallback.

---

# 80. AGENT COST / USAGE UI

Create an optional usage dashboard.

Show:

* Requests
* Agent tasks
* Model usage
* Tool usage
* Storage
* Project count

Do not make this dominate the UI.

---

# 81. ONBOARDING

First launch:

### Welcome to [APP NAME]

Choose what you want to build:

[Websites]

[Roblox Games]

[Desktop Apps]

[Games]

[Software]

[Everything]

Then:

### Connect your workspace

[Open Folder]

[Create Project]

Then:

### Choose your AI behavior

[Fast]

[Balanced]

[Maximum]

---

# 82. DEMO MODE

Create demo/sample projects so the interface does not feel empty.

Example projects:

* Roblox FPS
* React dashboard
* Python application
* FiveM resource

Populate demo chats and agent activity.

---

# 83. PROFESSIONAL EMPTY STATES

Do not leave blank screens.

Example:

Explorer empty:

> Open a project to start building.

[Open Folder]

Chat empty:

> What do you want to build?

---

# 84. RESPONSIVE PANELS

The UI should be highly customizable.

Users can:

* Resize sidebar
* Resize editor
* Resize terminal
* Resize agent panel
* Collapse panels
* Open multiple tabs
* Split editor
* Move panels

---

# 85. MULTI-WINDOW DESKTOP SUPPORT

Where practical, support separate windows for:

* Project
* Terminal
* Agent
* Preview
* Roblox connection
* Documentation

---

# 86. SEARCH EVERYTHING

Global search shortcut.

Search across:

* Chats
* Projects
* Files
* Extensions
* Commands
* Settings

---

# 87. SETTINGS SEARCH

Settings page should have a search box.

Example:

Search:

> terminal

Results:

* Terminal shell
* Terminal font
* Terminal permissions
* Terminal startup directory

---

# 88. HELP SYSTEM

Create built-in documentation.

Sections:

* Getting started
* Agent Mode
* Plan Mode
* Roblox
* Rojo
* MCP
* Extensions
* Desktop app
* Permissions
* Projects
* Models

---

# 89. INSTALLER

Create a desktop application download experience.

Windows:

.exe installer

macOS:

.dmg

Linux:

appropriate package where supported.

The web application should have:

[Download Desktop App]

---

# 90. UPDATE SYSTEM

Desktop app should have an update architecture.

Settings:

### Updates

Automatically check:

ON/OFF

Automatically install:

ON/OFF

---

# 91. FINAL UI QUALITY

The application MUST look polished.

Avoid:

* Generic SaaS dashboard
* Huge rounded cards everywhere
* Excessive gradients
* Cheap AI startup appearance
* Empty panels
* Poor spacing
* Inconsistent icons

The aesthetic should feel like a serious professional developer tool.

Think:

**VS Code + Cursor + Devin + modern AI interface**

Use:

* Dark professional UI
* Sharp hierarchy
* Subtle borders
* Clean typography
* Excellent spacing
* High information density
* Smooth but restrained animations

---

# 92. BRANDING

Create an original brand name and logo placeholder.

Do not use:

* Cursor branding
* OpenAI branding
* Anthropic branding
* Devin branding
* VS Code branding

The product needs its own identity.

Use placeholder name:

**NEXUS AI**

until I choose another name.

---

# 93. IMPORTANT DEVELOPMENT RULE

Do not build a fake prototype where buttons simply display:

> "Coming soon"

for every important feature.

Build actual functional foundations.

If a feature requires a backend integration that cannot be fully connected during the initial build, implement:

1. The real UI
2. The proper data model
3. The service interface
4. The permission system
5. The connection architecture
6. A working mock/local implementation where appropriate

Do not fake completed functionality.

---

# 94. BUILD PRIORITY

Build in phases.

## Phase 1 — Core

Build:

* Authentication
* Persistent chats
* Dashboard
* Projects
* Explorer
* Code editor
* Terminal
* Agent UI
* Plan mode
* Agent mode
* Settings
* Model selector
* File permissions

## Phase 2 — Desktop

Build:

* Desktop shell
* Local filesystem bridge
* Terminal bridge
* Project opening
* Native file access
* Permissions
* Notifications

## Phase 3 — AI Agent

Build:

* Tool architecture
* Agent loop
* File editing
* Terminal execution
* Planning
* Diff system
* Agent timeline
* Pause/stop/resume
* Error recovery

## Phase 4 — Development Modes

Build:

* Website
* Roblox
* FiveM
* Python
* Full Stack
* UI
* Debugger
* Code reviewer

## Phase 5 — Roblox

Build:

* Rojo integration
* Roblox Studio bridge architecture
* MCP support
* Roblox project detection
* Studio connection UI
* Script synchronization
* Output inspection

## Phase 6 — Extensions

Build:

* Extension system
* Marketplace UI
* Extension APIs
* Custom tools

## Phase 7 — Vision

Build:

* Image upload
* Screenshot analysis
* Vision agent
* Image generation architecture

## Phase 8 — Advanced Agents

Build:

* Multi-agent workflows
* Browser agent
* Web research
* Advanced autonomous execution
* Project indexing
* Codebase graph

---

# 95. DO NOT OVERBUILD THE LANDING PAGE AT THE EXPENSE OF THE APPLICATION

The actual application is the priority.

I care much more about:

* Working editor
* Working projects
* Working filesystem
* Working agent architecture
* Working terminal
* Working plans
* Working file modifications
* Working Roblox integration architecture
* Working settings

than flashy landing-page animations.

---

# 96. DESKTOP-FIRST DEVELOPMENT EXPERIENCE

The desktop application should feel like something a developer could genuinely use every day.

The central experience should look approximately like:

---

Sidebar | Editor / Chat / Preview | Agent Panel

```
    |                         |
    |                         |
    |                         |
    |-------------------------|
    | Terminal                |
```

---

Allow the user to switch between:

### Chat

### Code

### Agent

### Plan

### Preview

### Terminal

### Git

### Roblox

without leaving the project.

---

# 97. CHAT + CODE SPLIT VIEW

Allow:

Chat | Code

side by side.

Example:

User asks AI to modify player.lua.

AI responds in chat.

The editor automatically opens player.lua.

Show changes live.

---

# 98. AGENT + TERMINAL SPLIT VIEW

Allow:

Agent | Terminal

The user can watch the agent execute commands.

---

# 99. ROBLOX SPLIT VIEW

When Roblox Studio is connected:

Roblox Explorer | Code | Agent

The AI can inspect the Roblox project while the user watches.

---

# 100. FINAL GOAL

The final application should feel like:

> "I have an AI developer living inside my computer."

I should be able to open my computer, launch this application, open a project, connect Roblox Studio if needed, choose an agent mode, and tell the AI what I want.

The AI should be able to:

* Understand my project
* Read my files
* Search my code
* Make a plan
* Ask me questions when necessary
* Edit files
* Create files
* Run commands
* Test code
* Debug errors
* Search the web
* Understand screenshots
* Generate images
* Connect to development tools
* Work with Roblox Studio
* Work with Rojo
* Work with MCP-style integrations
* Use extensions
* Use specialized development modes
* Show me its activity
* Let me approve/reject changes
* Save all conversations
* Remember project context
* Recover from errors
* Roll back changes

It should NOT feel like:

> "ChatGPT with a code editor."

It should feel like:

> **A complete AI-powered development operating environment.**

Build the foundation so the platform can continue growing into a powerful AI developer capable of working across software development, web development, game development, Roblox development, desktop development, design, automation, and computer interaction.

Prioritize **real functionality, modular architecture, security, permissions, extensibility, and a professional developer experience** over superficial visual features.
do all in 4 stages

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2e6bc1e4-3085-4b49-8a39-fa7f13c2596e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
