# VEX IQ Scoring Practice

An interactive 3D web application for practicing VEX IQ Robotics Competition Mix & Match scoring. This project does not include edge cases, but could serve as a starting point for new scorekeeper referees and students to learn the scoring system of this season.

**Available at:** [vex-iq-scoring.jerryio.com](https://vex-iq-scoring.jerryio.com)

![VEX IQ Scoring Practice Screenshot](docs/web-app-screenshot.png)

## How to Play

Select a difficulty level and click "New" to generate a random scenario. Examine the 3D field and count the scoring items using the panel on the right (connected pins, beams, stacks, etc.). Click "Check" to verify your answer and see the correct score.

## Difficulty Levels

### Easy

- Simple field configurations
- Fewer stacks and game objects

### Medium

- Moderate complexity
- More varied stack configurations

### Hard

- Complex field layouts
- Some stacks may be placed outside of the floor goal

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0 or higher

### Installation

```bash
# Install dependencies
bun install
```

### Development

```bash
# Start development server
bun run dev
```

Visit `http://localhost:5173` to see the application.

### Build

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

### Code Formatting

```bash
# Format code with Prettier
bun run format
```

## Keyboard & Mouse Controls

### 3D Viewport

- **Left Click + Drag**: Rotate camera
- **Right Click + Drag**: Pan camera
- **Scroll Wheel**: Zoom in/out
- **Touch**: Pinch to zoom, drag to rotate

### Scoring Panel

- **Desktop**: Click arrow button on left to collapse/expand
- **Mobile**: Tap hamburger button to open, "Close" to dismiss

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with WebGL support

## Contributing

This is a practice/educational project. Feel free to fork and modify for your own use.

## License

This project is licensed under the GNU General Public License v3.0 (GPLv3). See the [LICENSE](LICENSE) file for details.

VEX IQ is a trademark of Innovation First International, Inc. This project is for educational purposes.
