var EmailDataSender = (address, text, subject, body) => {
  address = address || 'collectionsdata@artsmia.org'
  return `<a href="mailto:${address}?subject=${subject}&body=%0A%0A---%0A${body}">${text || address}</a>`
}

module.exports = EmailDataSender

