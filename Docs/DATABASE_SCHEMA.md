# Database Schema – TickeGo

## Users Collection

Fields:

- _id
- name
- email
- password
- role (user | organizer | admin)
- profileImage
- createdEvents
- purchasedTickets
- createdAt

## Events Collection

Fields:

- _id
- title
- description
- category
- date
- location
- price
- totalTickets
- availableTickets
- organizerId
- poster
- speakers
- status (pending | approved | rejected)
- createdAt

## Tickets Collection

Fields:

- _id
- eventId
- ownerId
- originalPrice
- currentPrice
- status (active | used | cancelled)
- isResale
- qrCode
- purchaseDate

## ResaleListings Collection

Fields:

- _id
- ticketId
- sellerId
- price
- status (active | sold | cancelled)
- buyerId
- createdAt

## Speakers Collection

Fields:

- _id
- name
- bio
- photo
- socialLinks
- events

## Reviews Collection

Fields:

- _id
- eventId
- userId
- rating
- comment
- createdAt