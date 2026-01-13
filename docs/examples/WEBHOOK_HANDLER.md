# Example: Webhook Handler
```javascript
// Express.js webhook handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  if (!verifySignature(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }
  const { event, data } = req.body;
  switch (event) {
    case 'violation.detected':
      handleViolation(data);
      break;
    case 'alert.triggered':
      handleAlert(data);
      break;
  }
  res.status(200).send('OK');
});
```
