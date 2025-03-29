# United Defense Tactical Website

A modern, responsive website for United Defense Tactical, a premier firearms and self-defense training center located in Anaheim Hills, California.

## Project Structure

```
united-defense-tactical/
├── index.html              # Main HTML document
├── css/
│   ├── reset.css           # CSS reset and base styles
│   ├── styles.css          # Main stylesheet
│   └── responsive.css      # Media queries for responsive design
├── js/
│   └── main.js             # JavaScript functionality
├── images/                 # Image assets directory
│   ├── hero-bg.jpg
│   ├── instructor-photos/
│   └── training-photos/
└── README.md               # Project documentation
```

## Features

- **Modular CSS Architecture**: Stylesheets are organized by purpose
- **Responsive Design**: Mobile-first approach with breakpoints for all device sizes
- **Performance Optimized**: Efficient code structure and optimized assets
- **Accessibility Focused**: Semantic HTML and ARIA attributes where necessary
- **Clean, Maintainable Code**: Consistent formatting and well-commented code

## Getting Started

1. Clone this repository to your local machine
2. Open `index.html` in your browser to view the site
3. Make any desired modifications to the HTML, CSS, or JavaScript files

## Implementation Notes

### CSS Variables

The project uses CSS custom properties (variables) to maintain consistent colors, spacing, and other visual elements. These are defined in the `:root` selector in `styles.css`.

### Responsive Breakpoints

- **Large**: 1200px and below
- **Medium**: 992px and below
- **Small**: 768px and below
- **Extra Small**: 576px and below

### JavaScript Functionality

- Mobile menu toggle
- Form submission handling
- Smooth scrolling for anchor links
- Animation on scroll
- Map integration (placeholder implementation)

## Production Considerations

Before deploying to production:

1. **Optimize Images**: Compress all images for web
2. **Minify Assets**: Consider minifying CSS and JavaScript files
3. **Add Google Maps API**: Replace the map placeholder with an actual Google Maps integration
4. **Add Form Handling**: Implement server-side form processing
5. **Add Icon Font**: Replace text icons with a proper icon font like Font Awesome or custom SVG icons

## Browser Support

This site is designed to work with all modern browsers (Chrome, Firefox, Safari, Edge).

## License

All rights reserved. This is a proprietary design for United Defense Tactical.