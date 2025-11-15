# KnoRa Frontend - Deployment & Testing Checklist

## Pre-Deployment Verification

### Code Quality
- [ ] Run `npx tsc --noEmit` - No TypeScript errors
- [ ] Run `npm run build` - Build succeeds with no errors
- [ ] Check for console errors - Open DevTools console, no red errors
- [ ] Check for warnings - No yellow warnings in console
- [ ] Verify all imports - No missing dependencies or modules

### Browser Testing
- [ ] Test in Chrome/Edge (latest) - All features work
- [ ] Test in Firefox (latest) - All features work
- [ ] Test in Safari (latest) - All features work
- [ ] Test in mobile Chrome - All features work
- [ ] Test in mobile Safari (iOS) - All features work

---

## Feature Verification

### Search Functionality
- [ ] Can upload a PDF document
- [ ] Can upload a DOCX document
- [ ] Can upload a CSV file
- [ ] Document appears in "Processed Documents" list
- [ ] Can search with a query
- [ ] Search returns relevant results
- [ ] Results show similarity scores
- [ ] Answer is generated from search results
- [ ] Sources are listed below answer

### Error Handling
- [ ] Stop backend server (http://localhost:8000/api)
- [ ] Try to perform search
- [ ] See user-friendly error message (not technical jargon)
- [ ] Error has dismiss button (X)
- [ ] Error is dismissible
- [ ] Restart backend
- [ ] Search works again
- [ ] Try file upload with missing backend
- [ ] See appropriate error message

### Results Management
- [ ] Clear button appears after search
- [ ] Click Clear
- [ ] Results disappear
- [ ] Query is cleared
- [ ] Answer is removed
- [ ] UI returns to empty state

### Search Cancellation
- [ ] Start a search
- [ ] Click Cancel button (appears during search)
- [ ] Search stops immediately
- [ ] UI updates with cancelled state
- [ ] Can start new search after cancel

---

## Mobile Testing

### iPhone/iPad
- [ ] Tap menu button (hamburger icon)
- [ ] Menu opens
- [ ] Tap a tab
- [ ] Menu closes automatically
- [ ] Tab content displays
- [ ] Form inputs are readable
- [ ] Buttons have adequate padding
- [ ] No horizontal scrolling needed

### Android
- [ ] Same tests as iPhone/iPad
- [ ] Touch targets are large enough (44px+)
- [ ] Menu works properly
- [ ] Rotate to landscape - layout adapts
- [ ] Rotate back to portrait - layout restores

### Touch Interactions
- [ ] Can tap buttons reliably
- [ ] Can type in search box
- [ ] Can interact with sliders
- [ ] Can close menu by tapping outside
- [ ] Can press Escape to close menu

---

## Keyboard Navigation

### Tab Navigation
- [ ] Press Tab key repeatedly
- [ ] Focus moves through all interactive elements
- [ ] Focus visible as blue ring
- [ ] Can reach: search input, k slider, threshold slider, buttons
- [ ] Can reach: Temperature, Max Tokens, Model select
- [ ] Can reach: Copy, Speak buttons
- [ ] Can reach: Search/Cancel/Clear buttons

### Keyboard Actions
- [ ] Tab to search input
- [ ] Type query
- [ ] Press Enter (or Shift+Enter)
- [ ] Search executes
- [ ] Tab to Cancel button
- [ ] Press Enter
- [ ] Search cancels
- [ ] Press Escape
- [ ] Mobile menu closes (if open)

### Focus Visibility
- [ ] All focused elements have visible focus ring
- [ ] Focus ring is contrasted (not invisible)
- [ ] Focus order makes logical sense
- [ ] Can navigate backwards with Shift+Tab

---

## Accessibility Testing

### Screen Reader (VoiceOver on Mac)
- [ ] Enable VoiceOver (Cmd+F5)
- [ ] Navigate with VO+Right Arrow
- [ ] Every button is read with accessible name
- [ ] Form labels are read before inputs
- [ ] Tab roles are announced ("tab" element)
- [ ] Active tab is announced ("selected")
- [ ] Loading state is announced ("busy")
- [ ] Error messages are read

### Screen Reader (NVDA on Windows)
- [ ] Same tests as VoiceOver
- [ ] Navigate through entire page
- [ ] All interactive elements announced
- [ ] Landmarks announced (navigation, main)
- [ ] Headings announced with level

### Color Contrast
- [ ] Text is readable on background
- [ ] Buttons have sufficient contrast
- [ ] Error messages are readable
- [ ] All UI text meets WCAG AA standard (4.5:1)

### Form Accessibility
- [ ] Search label is associated with input
- [ ] Search input has placeholder text
- [ ] Form error messages are clear
- [ ] Required fields marked with * (asterisk with text)
- [ ] All inputs have accessible labels

---

## Analytics Tab Testing

### Data Display
- [ ] Total Vectors displayed
- [ ] Total Documents displayed
- [ ] Embedding Dimension shown
- [ ] Uploaded Files Size shown
- [ ] All stats have values (not blank)
- [ ] Auto-refresh checkbox works
- [ ] Refresh button updates stats

### Storage Management
- [ ] File storage list displays
- [ ] File names visible
- [ ] File sizes shown
- [ ] Total size calculated correctly
- [ ] Cleanup button available
- [ ] Click Cleanup
- [ ] Old files removed
- [ ] Stats refresh after cleanup

### System Configuration
- [ ] Embedding model displayed
- [ ] Average chunks per doc shown
- [ ] Vector dimension shown
- [ ] Store path visible
- [ ] All info accurate

---

## Document Ingestion Tab Testing

### Upload
- [ ] File upload area visible
- [ ] Can drag & drop files
- [ ] Can click to select files
- [ ] File validation works
- [ ] Shows progress during upload
- [ ] Shows completion message
- [ ] Shows error if upload fails
- [ ] Can retry failed uploads

### Document List
- [ ] Uploaded documents appear in list
- [ ] File name displayed
- [ ] File type shown (PDF, DOCX, etc.)
- [ ] Number of chunks displayed
- [ ] File size shown
- [ ] Delete button visible on hover
- [ ] Click delete
- [ ] Document removed from list
- [ ] Delete confirmed with toast message

### Empty State
- [ ] When no documents, shows helpful message
- [ ] Message suggests uploading a document
- [ ] Icon displayed for clarity

---

## Settings & Parameters

### Basic Controls
- [ ] Results (k) slider works (1-20)
- [ ] Value updates in real-time
- [ ] Threshold slider works (0-1)
- [ ] Value displayed as decimal (e.g., "0.50")

### Advanced Settings
- [ ] "Show Advanced Settings" toggle works
- [ ] Advanced section expands
- [ ] Temperature slider works (0-2)
- [ ] Max Tokens slider works (256-8192)
- [ ] Model select dropdown works
- [ ] All controls disabled during search
- [ ] Settings persist after page reload (if not cleared)

---

## Home Page Testing

### Navigation
- [ ] Click "Get Started" button
- [ ] Goes to main app (/?tab=ingestion)
- [ ] Logo links to /home
- [ ] Navigation working from home page

### Content Display
- [ ] Hero section visible
- [ ] Features section displays 3 cards
- [ ] System Architecture section expandable
- [ ] Workflow section expandable
- [ ] Supported Formats displayed
- [ ] Privacy & Security section expandable
- [ ] FAQ section expandable
- [ ] CTA button at bottom

### Expandable Sections
- [ ] Click section title
- [ ] Section expands smoothly
- [ ] Content visible
- [ ] Click again
- [ ] Section collapses
- [ ] Chevron icon updates (up/down)

---

## Error Scenarios

### Network Errors
- [ ] Disconnect WiFi/network
- [ ] Try search
- [ ] See "Cannot connect to backend" error
- [ ] Reconnect network
- [ ] Try search again
- [ ] Should work (retry logic)

### Backend Down
- [ ] Stop backend server
- [ ] Refresh page
- [ ] See connection error message
- [ ] Click "Retry Connection"
- [ ] Still shows error (backend still down)
- [ ] Start backend
- [ ] Click Retry again
- [ ] App loads successfully

### Timeout
- [ ] (Simulated by throttling network)
- [ ] Slow network → search times out
- [ ] Retry happens automatically
- [ ] Search may succeed on second attempt
- [ ] If still fails, show error message

### Rate Limiting (if applicable)
- [ ] Make 10 rapid searches
- [ ] May see "Too many requests" error
- [ ] Wait a moment
- [ ] Try again
- [ ] Works (rate limit reset)

### Invalid Input
- [ ] Leave search box empty
- [ ] Click Search
- [ ] See "Please enter a query" error
- [ ] Try uploading oversized file (>100MB)
- [ ] See "File too large" error
- [ ] Try uploading unsupported format
- [ ] See "Unsupported file type" error

---

## Performance Testing

### Load Times
- [ ] Page loads in < 3 seconds
- [ ] First search returns in < 5 seconds
- [ ] Subsequent searches faster (cached)
- [ ] No jank or stuttering during load
- [ ] No flashing or flickering

### Animation Performance
- [ ] Menu opens smoothly
- [ ] Results fade in without jank
- [ ] No animation lag at 60fps
- [ ] Smooth transitions between states
- [ ] No CPU overload (check Task Manager)

### Memory Usage
- [ ] Perform 5 searches
- [ ] Check memory usage (DevTools → Memory)
- [ ] Memory doesn't grow unbounded
- [ ] No memory leaks detected
- [ ] Clear results, memory released

---

## Storage & Persistence

### LocalStorage
- [ ] Close browser tab
- [ ] Reopen site
- [ ] Settings preserved (k value, threshold, etc.)
- [ ] Tab selection preserved
- [ ] Perform search
- [ ] Close browser
- [ ] Reopen
- [ ] Search results NOT preserved (expected)
- [ ] Query text NOT preserved (expected)

### Browser Compatibility
- [ ] localStorage works in all browsers
- [ ] Settings sync across tabs (same browser)
- [ ] No errors in DevTools console
- [ ] Clear Site Data works

---

## Documentation Review

### Documentation Files
- [ ] FRONTEND_IMPROVEMENTS.md exists (412 lines)
- [ ] IMPROVEMENTS_QUICK_REF.md exists (279 lines)
- [ ] SUMMARY.md exists (~460 lines)
- [ ] CHECKLIST.md (this file)
- [ ] All markdown files readable

### Documentation Quality
- [ ] Clear problem descriptions
- [ ] Solution explanations
- [ ] Code examples provided
- [ ] Test scenarios listed
- [ ] Deployment steps clear
- [ ] Support information available

---

## Final Sign-Off

### Code Review
- [ ] All TypeScript checks pass
- [ ] No console errors
- [ ] No memory warnings
- [ ] Build successful
- [ ] No breaking changes
- [ ] Backward compatible

### Testing Complete
- [ ] All features verified
- [ ] All error scenarios tested
- [ ] Mobile experience verified
- [ ] Keyboard navigation tested
- [ ] Accessibility verified
- [ ] Performance acceptable

### Documentation Complete
- [ ] All improvement docs written
- [ ] Examples provided
- [ ] Test checklist created
- [ ] Deployment guide ready
- [ ] Support info available

### Ready for Deployment
- [ ] Code: ✅ Ready
- [ ] Tests: ✅ Passed
- [ ] Docs: ✅ Complete
- [ ] Performance: ✅ Good
- [ ] Accessibility: ✅ Verified
- [ ] Mobile: ✅ Tested

---

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor error logs
- [ ] Check for increased error rates
- [ ] Verify no spike in timeouts
- [ ] Monitor user feedback
- [ ] Check browser console for errors

### First Week
- [ ] Review analytics
- [ ] Check mobile experience reports
- [ ] Monitor search success rate
- [ ] Verify accessibility works as expected
- [ ] Gather user feedback

### Ongoing
- [ ] Monthly error rate review
- [ ] Quarterly performance audit
- [ ] User feedback collection
- [ ] Feature request tracking
- [ ] Bug report monitoring

---

## Rollback Plan (If Needed)

### Quick Rollback
1. Keep previous frontend build
2. Deploy previous .next/ directory
3. Clear browser cache
4. Verify old version loads
5. Check for any issues

### Communication
- [ ] Notify users of rollback
- [ ] Explain reason (if needed)
- [ ] Provide timeline for re-deployment
- [ ] Gather feedback on what went wrong

---

## Sign-Off Checklist

### Development Team
- [ ] Code review complete
- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Approved for deployment

### QA Team
- [ ] Manual testing complete
- [ ] Accessibility verified
- [ ] Mobile testing passed
- [ ] Error scenarios tested

### DevOps Team
- [ ] Build process verified
- [ ] Deployment process ready
- [ ] Monitoring configured
- [ ] Rollback plan ready

### Product Owner
- [ ] Features verified
- [ ] User experience acceptable
- [ ] Performance meets standards
- [ ] Approved for production release

---

## Notes & Comments

```
[Space for deployment notes]
- 
- 
- 
```

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | - | - | - |
| QA | - | - | - |
| DevOps | - | - | - |
| Product | - | - | - |

---

**Deployment Date**: ___________
**Status**: ☐ Ready ☐ Blocked ☐ Deployed
**Build Version**: ___________
**Notes**: _________________________________________________________________

---

**Created**: 2024
**Last Updated**: 2024
**Version**: 1.0