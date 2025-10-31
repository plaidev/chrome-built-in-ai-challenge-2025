/**
 * UI Display Functions
 * Handles tour display and UI updates
 */

/**
 * Display activity search results
 */
export function displayActivities(results) {
  const tourSection = document.getElementById('tourRecommendations');
  const tourGrid = document.querySelector('.tour-grid');

  if (!tourSection || !tourGrid) return;

  // Clear existing content
  tourGrid.innerHTML = '';

  if (!results || results.length === 0) {
    tourGrid.innerHTML = '<p style="text-align: center; color: #6c757d;">No activities found.</p>';
    tourSection.style.display = 'block';
    return;
  }

  // Display each platform's results
  results.forEach((platformResult) => {
    const platformCard = createPlatformActivityCard(platformResult);
    tourGrid.appendChild(platformCard);
  });

  tourSection.style.display = 'block';

  // Initialize scroll buttons
  initializeScrollButtons();
}

/**
 * Create platform activity card with markdown rendering
 */
function createPlatformActivityCard(platformResult) {
  const card = document.createElement('div');
  card.className = 'activity-card';

  // Remove platform header from text (e.g., "## Klook") since we show it in the card header
  let textWithoutHeader = platformResult.textWithCitations;
  textWithoutHeader = textWithoutHeader.replace(/^##\s*[^\n]+\n*/i, '').trim();

  // Configure marked.js to open links in new tab
  const renderer = new marked.Renderer();
  renderer.link = function(token) {
    const href = token.href || '';
    const title = token.title || '';
    const text = token.text || '';
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`;
  };

  // Use marked.js to convert markdown to HTML
  const htmlContent = marked.parse(textWithoutHeader, { renderer });

  // Add platform header
  const platformHeader = `
    <div class="activity-platform-header">
      <h3>${escapeHtml(platformResult.platform)}</h3>
      <span class="platform-domain">${escapeHtml(platformResult.domain)}</span>
    </div>
  `;

  // Add images if available
  let imagesHtml = '';
  if (platformResult.images && platformResult.images.length > 0) {
    const validImages = platformResult.images.filter(img => img && img.url);
    if (validImages.length > 0) {
      imagesHtml = `
        <div class="activity-images">
          ${validImages.slice(0, 3).map(img => `
            <img
              src="${escapeHtml(img.url)}"
              alt="${escapeHtml(img.alt || 'Activity image')}"
              class="activity-image"
              data-fallback="${img.isFallback ? 'true' : 'false'}"
            />
          `).join('')}
        </div>
      `;
    }
  }

  card.innerHTML = `
    <div class="activity-card-content">
      ${platformHeader}
      ${imagesHtml}
      <div class="activity-description markdown-content">
        ${htmlContent}
      </div>
    </div>
  `;

  return card;
}

/**
 * Create skeleton card for loading state
 */
function createSkeletonCard() {
  const card = document.createElement('div');
  card.className = 'tour-card skeleton-card';

  card.innerHTML = `
    <div class="skeleton-content">
      <!-- Activity 1 -->
      <!-- Title -->
      <div class="skeleton-title" style="height: 24px; margin-bottom: 1rem;"></div>

      <!-- Description section -->
      <div style="margin-bottom: 1rem;">
        <div class="skeleton-label" style="width: 100px; margin-bottom: 0.5rem;"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-description" style="width: 85%;"></div>
      </div>

      <!-- Highlights section -->
      <div style="margin-bottom: 1rem;">
        <div class="skeleton-label" style="width: 90px; margin-bottom: 0.5rem;"></div>
        <div class="skeleton-value" style="margin-bottom: 0.4rem;"></div>
        <div class="skeleton-value" style="margin-bottom: 0.4rem;"></div>
        <div class="skeleton-value" style="margin-bottom: 0.4rem;"></div>
        <div class="skeleton-value" style="width: 80%;"></div>
      </div>

      <!-- Budget section -->
      <div style="margin-bottom: 2rem;">
        <div class="skeleton-label" style="width: 70px; margin-bottom: 0.5rem;"></div>
        <div class="skeleton-value" style="width: 60%;"></div>
      </div>

      <!-- Activity 2 -->
      <!-- Title -->
      <div class="skeleton-title" style="height: 24px; margin-bottom: 1rem;"></div>

      <!-- Description section -->
      <div style="margin-bottom: 1rem;">
        <div class="skeleton-label" style="width: 100px; margin-bottom: 0.5rem;"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-description" style="width: 85%;"></div>
      </div>

      <!-- Highlights section -->
      <div style="margin-bottom: 1rem;">
        <div class="skeleton-label" style="width: 90px; margin-bottom: 0.5rem;"></div>
        <div class="skeleton-value" style="margin-bottom: 0.4rem;"></div>
        <div class="skeleton-value" style="margin-bottom: 0.4rem;"></div>
        <div class="skeleton-value" style="margin-bottom: 0.4rem;"></div>
        <div class="skeleton-value" style="width: 80%;"></div>
      </div>

      <!-- Budget section -->
      <div>
        <div class="skeleton-label" style="width: 70px; margin-bottom: 0.5rem;"></div>
        <div class="skeleton-value" style="width: 60%;"></div>
      </div>
    </div>
  `;

  return card;
}

/**
 * Show skeleton loading cards
 */
function showSkeletonCards(count = 3) {
  const tourSection = document.getElementById('tourRecommendations');
  const tourGrid = document.querySelector('.tour-grid');
  const scrollLeft = document.getElementById('tourScrollLeft');
  const scrollRight = document.getElementById('tourScrollRight');

  if (!tourSection || !tourGrid) return;

  // Clear existing content
  tourGrid.innerHTML = '';

  // Add skeleton cards
  for (let i = 0; i < count; i++) {
    const skeletonCard = createSkeletonCard();
    tourGrid.appendChild(skeletonCard);
  }

  // Hide scroll buttons during loading
  if (scrollLeft) scrollLeft.style.display = 'none';
  if (scrollRight) scrollRight.style.display = 'none';

  tourSection.style.display = 'block';
}

/**
 * Show loading state
 */
export function showLoadingState(message = 'Searching activities...') {
  const searchProgress = document.getElementById('searchProgress');
  const progressMessage = document.getElementById('progressMessage');

  if (searchProgress) searchProgress.style.display = 'block';
  if (progressMessage) progressMessage.textContent = message;

  // Show skeleton cards
  showSkeletonCards(3);
}

/**
 * Hide loading state
 */
export function hideLoadingState() {
  const searchProgress = document.getElementById('searchProgress');
  if (searchProgress) searchProgress.style.display = 'none';
}

/**
 * Show error message
 */
export function showError(message) {
  const tourSection = document.getElementById('tourRecommendations');
  const tourGrid = document.querySelector('.tour-grid');

  if (!tourSection || !tourGrid) return;

  tourGrid.innerHTML = `
    <div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: #dc3545; text-align: center;">
      <p style="font-size: 1rem; margin-bottom: 0.5rem;"><strong>Error:</strong> ${escapeHtml(message)}</p>
      <p style="color: #6c757d; font-size: 0.9rem;">
        Please try again or check your connection.
      </p>
    </div>
  `;

  tourSection.style.display = 'block';
}

/**
 * Utility: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initialize scroll buttons for tour grid
 */
function initializeScrollButtons() {
  const scrollLeft = document.getElementById('tourScrollLeft');
  const scrollRight = document.getElementById('tourScrollRight');
  const tourGrid = document.querySelector('.tour-grid');

  if (!scrollLeft || !scrollRight || !tourGrid) return;

  // Show scroll buttons when displaying actual content
  scrollLeft.style.display = '';
  scrollRight.style.display = '';

  const scrollAmount = 380; // Card width + gap

  // Remove existing listeners if any
  const newScrollLeft = scrollLeft.cloneNode(true);
  const newScrollRight = scrollRight.cloneNode(true);
  scrollLeft.parentNode.replaceChild(newScrollLeft, scrollLeft);
  scrollRight.parentNode.replaceChild(newScrollRight, scrollRight);

  // Add click listeners
  newScrollLeft.addEventListener('click', () => {
    tourGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  newScrollRight.addEventListener('click', () => {
    tourGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  // Update button states on scroll
  function updateScrollButtons() {
    const isAtStart = tourGrid.scrollLeft <= 0;
    const isAtEnd = tourGrid.scrollLeft + tourGrid.clientWidth >= tourGrid.scrollWidth - 1;

    newScrollLeft.disabled = isAtStart;
    newScrollRight.disabled = isAtEnd;
  }

  tourGrid.addEventListener('scroll', updateScrollButtons);
  updateScrollButtons(); // Initial state
}
