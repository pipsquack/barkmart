# Datadog RUM Integration

This document describes how Datadog Real User Monitoring (RUM) is integrated into the BarkMart application.

## Overview

Datadog RUM provides real-time monitoring and analytics for frontend performance, user interactions, and errors in the BarkMart e-commerce application.

## Features Tracked

- **Page Views**: All page navigation and route changes
- **User Sessions**: Complete user journey tracking
- **Resources**: Loading performance of images, scripts, and API calls
- **Long Tasks**: JavaScript execution delays
- **User Interactions**: Clicks, form submissions, and navigation
- **Errors**: Frontend JavaScript errors and exceptions
- **Session Replay**: Visual playback of user sessions (20% sample rate)
- **User Context**: Authenticated user information (email, name, admin status)

## Configuration

### Environment Variables

The following environment variables control Datadog RUM:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DD_RUM_ENABLED` | Enable/disable RUM tracking | `false` | Yes |
| `DD_RUM_CLIENT_TOKEN` | Datadog RUM client token | - | Yes |
| `DD_RUM_APPLICATION_ID` | Datadog RUM application ID | - | Yes |
| `DD_RUM_SITE` | Datadog site (e.g., datadoghq.com) | `datadoghq.com` | No |
| `DD_RUM_SERVICE` | Service name | `barkmart` | No |
| `DD_ENV` | Environment name (development, production, etc.) | `production` | No |
| `APP_VERSION` | Application version (for tracking in RUM) | `1.0.0` | No |
| `DD_RUM_SESSION_SAMPLE_RATE` | Percentage of sessions to track (0-100) | `100` | No |
| `DD_RUM_SESSION_REPLAY_SAMPLE_RATE` | Percentage of sessions to replay (0-100) | `20` | No |

### Getting Started

#### 1. Create a RUM Application in Datadog

1. Log in to your Datadog account at https://app.datadoghq.com
2. Navigate to **UX Monitoring** → **RUM Applications**
3. Click **New Application**
4. Select **JS** as the application type
5. Enter application name: `barkmart`
6. Copy the generated:
   - **Client Token**
   - **Application ID**

#### 2. Configure Environment Variables

##### Local Development

Edit `.env`:

```bash
DD_RUM_ENABLED=true
DD_RUM_CLIENT_TOKEN=your-client-token-here
DD_RUM_APPLICATION_ID=your-application-id-here
DD_RUM_SITE=datadoghq.com  # or datadoghq.eu for EU
DD_RUM_SERVICE=barkmart
DD_RUM_SESSION_SAMPLE_RATE=100
DD_RUM_SESSION_REPLAY_SAMPLE_RATE=20
DD_ENV=development
APP_VERSION=1.0.0
```

##### Docker Compose

Edit `docker-compose.yml` environment section:

```yaml
environment:
  DD_RUM_ENABLED: "true"
  DD_RUM_CLIENT_TOKEN: "your-client-token-here"
  DD_RUM_APPLICATION_ID: "your-application-id-here"
```

##### Kubernetes

Edit `k8s/secret.yaml`:

```yaml
stringData:
  DD_RUM_CLIENT_TOKEN: "your-client-token-here"
  DD_RUM_APPLICATION_ID: "your-application-id-here"
```

Edit `k8s/configmap.yaml`:

```yaml
data:
  DD_RUM_ENABLED: "true"
```

Then apply:

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl rollout restart deployment/barkmart-app -n barkmart
```

#### 3. Verify Integration

1. Start the application
2. Open the browser and navigate to your application
3. Open browser DevTools → Console
4. Look for Datadog RUM initialization messages
5. Check Datadog dashboard for incoming data (may take 1-2 minutes)

## Data Collected

### Automatic Tracking

- **Page loads**: Initial page load performance
- **Route changes**: SPA-like navigation (if applicable)
- **Resource loading**: CSS, JS, images, fonts
- **XHR/Fetch requests**: AJAX calls to backend APIs
- **JavaScript errors**: Unhandled exceptions
- **Console errors**: Error-level console logs

### User Context

When a user is authenticated, the following information is tracked:

```javascript
{
  id: "user-id",
  email: "user@example.com",
  name: "First Last",
  is_admin: false
}
```

This allows filtering and analyzing user behavior based on user attributes.

### Custom Context

Admin users have additional context:

```javascript
{
  section: "admin"
}
```

This helps distinguish admin panel activity from regular user activity.

## Privacy & Compliance

### Data Masking

The integration uses `defaultPrivacyLevel: 'mask-user-input'` which:

- Masks all user input in form fields
- Redacts sensitive data in session replays
- Prevents password and credit card capture

### Sample Rates

- **Session Sample Rate**: 100% (all sessions tracked)
- **Session Replay Sample Rate**: 20% (only 20% of sessions recorded)

You can adjust these rates in the environment variables:

```bash
DD_RUM_SESSION_SAMPLE_RATE=50        # Track 50% of sessions
DD_RUM_SESSION_REPLAY_SAMPLE_RATE=10 # Record 10% of sessions
```

### GDPR Compliance

To comply with GDPR:

1. Update your privacy policy to mention Datadog tracking
2. Implement cookie consent (if required in your jurisdiction)
3. Consider reducing sample rates for EU users
4. Use Datadog EU site (`datadoghq.eu`) for EU data residency

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Error Rate**: Frontend JavaScript errors
2. **Page Load Time**: P75, P95, P99 load times
3. **User Session Duration**: Average time spent
4. **Conversion Rate**: Cart → Checkout → Order completion
5. **Resource Loading**: Slow-loading images or scripts

### Recommended Dashboards

Create dashboards in Datadog for:

- **Performance**: Page load times, resource timing
- **Errors**: Error count, affected users, error types
- **User Journey**: Funnel from product view → cart → checkout → order
- **Admin Activity**: Admin panel usage and performance

### Setting Up Alerts

Example alerts:

1. **High Error Rate**: Alert if error rate > 5%
2. **Slow Page Load**: Alert if P95 > 3 seconds
3. **Failed Checkouts**: Alert if checkout error rate > 2%

## Custom Actions & Events

You can add custom tracking to specific user actions:

### In Views

Add to any EJS template:

```html
<script>
  // Track custom action
  window.DD_RUM && window.DD_RUM.addAction('product_added_to_cart', {
    product_id: '<%= product.id %>',
    product_name: '<%= product.name %>',
    price: <%= product.price %>
  });
</script>
```

### In Frontend JavaScript

Add to `/public/js/main.js`:

```javascript
// Track cart additions
$(document).on('click', '.add-to-cart', function() {
  window.DD_RUM && window.DD_RUM.addAction('add_to_cart_clicked', {
    product_id: $(this).data('product-id')
  });
});

// Track checkout steps
$(document).on('click', '.checkout-button', function() {
  window.DD_RUM && window.DD_RUM.addAction('checkout_initiated');
});
```

## Troubleshooting

### RUM Not Loading

1. Check `DD_RUM_ENABLED` is set to `true`
2. Verify `DD_RUM_CLIENT_TOKEN` and `DD_RUM_APPLICATION_ID` are correct
3. Check browser console for errors
4. Verify network requests to `datadoghq-browser-agent.com`

### No Data in Datadog

1. Wait 1-2 minutes for data to appear
2. Check Datadog site matches your configuration
3. Verify client token and application ID
4. Check sample rate is > 0

### User Information Not Appearing

1. Verify user is logged in
2. Check `res.locals.user` is populated in server.js
3. View page source and verify user data in RUM init script

### Session Replays Not Working

1. Check `DD_RUM_SESSION_REPLAY_SAMPLE_RATE` is > 0
2. Verify you're viewing a sampled session
3. Check browser is supported (Chrome, Firefox, Safari, Edge)

## Performance Impact

The Datadog RUM SDK is optimized for minimal performance impact:

- **Load Time**: ~5-10ms added to initial page load
- **Memory**: ~2-5MB additional memory usage
- **CPU**: Negligible impact on modern devices
- **Network**: ~100KB SDK download (cached after first load)

## Disabling RUM

To disable RUM tracking:

### Temporarily (without redeployment)

Set environment variable:

```bash
DD_RUM_ENABLED=false
```

### Permanently

1. Set `DD_RUM_ENABLED=false` in environment
2. Or remove RUM configuration entirely from `.env`

## Additional Resources

- [Datadog RUM Documentation](https://docs.datadoghq.com/real_user_monitoring/)
- [Browser SDK API Reference](https://docs.datadoghq.com/real_user_monitoring/browser/)
- [RUM Best Practices](https://docs.datadoghq.com/real_user_monitoring/guide/best-practices/)
- [Session Replay](https://docs.datadoghq.com/real_user_monitoring/session_replay/)

## Support

For issues with the integration:

1. Check this documentation
2. Review Datadog RUM documentation
3. Contact Datadog support
4. File an issue in the repository

## Example Queries

### View All User Sessions
```
@type:session service:barkmart
```

### View JavaScript Errors
```
@type:error service:barkmart
```

### View Slow Page Loads
```
@type:view @view.loading_time:>3s service:barkmart
```

### View Admin Activity
```
@context.section:admin service:barkmart
```

### View Checkout Funnel
```
@view.url_path:/checkout* service:barkmart
```
