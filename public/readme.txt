

Product Functional Description (PFD): Real-Time Booking & Property Management System
Version: 2.0
Date: July 12, 2025
1. Overview & Vision
This document outlines the functional requirements for a comprehensive, real-time booking and property management application. The system is designed for property owners to seamlessly manage accommodation listings, bookings, payments, and guest interactions from a centralized platform.
The core vision is to create a fully automated and efficient platform that minimizes administrative overhead and enhances the guest experience. When a customer makes a booking, the system will instantly process the payment, update the availability calendar across all platforms, and notify all relevant parties immediately. This ensures a smooth, error-free experience for both the property owner and the end customer.
2. Core Features
2.1. Listing Management: Your Digital Storefront
The foundation of a successful rental business lies in a compelling and accurately represented listing. The application will provide a robust suite of tools to create, edit, and manage a property's profile.
Core Listing Details:
Title & Description: Craft an engaging title and a detailed description that highlights the unique aspects of the space.
Photos & Videos: Upload high-quality photos and video tours to visually merchandise the listing.
Amenities: Select from a comprehensive checklist of amenities to accurately inform potential guests.
Location: Pinpoint the property on a map and provide details about the neighborhood.
House Rules: Clearly outline expectations for guests regarding parties, smoking, pets, etc.
Guest Requirements: Set criteria for who can book the space.
Listing Status: Easily activate or deactivate a listing as needed.
Advanced Listing Features:
Co-hosting: Add and manage co-hosts, granting them specific permissions to assist with managing the listing, guests, and calendar.
Multi-Property Management: For owners with more than one listing, the app will allow for easy switching and management of all properties from a single dashboard.
2.2. Real-time Bookings & Calendar Synchronization
Instant Booking: Customers can view available accommodations and book directly on the platform without delay. Enable or disable this feature as needed.
Booking Requests: Optionally, review and manually approve booking requests.
Real-time Availability: The system's calendar is the single source of truth. Once a booking is confirmed, the corresponding dates will be instantly and automatically blocked out.
No Double Bookings: The real-time synchronization ensures that a property cannot be booked by more than one person for the same time slot.
Multi-Calendar View: For hosts with multiple listings, a unified calendar view allows for a comprehensive overview of all bookings.
External Calendar Sync: Sync the system's calendar with other calendars (e.g., Google Calendar) to avoid double bookings.
2.3. Guest Communication: The Heart of Hospitality
Effective communication is critical for positive guest experiences. The application is designed to facilitate instant and organized interaction.
Unified Inbox: A centralized inbox to manage all guest communications, from initial inquiries to post-stay follow-ups.
Saved Replies: Create and use pre-written responses to frequently asked questions to save time and ensure consistent communication.
Scheduled Messages: Automate sending key information to guests at specific times, such as check-in instructions the day before arrival or a thank-you note after checkout.
Photo & Video Messaging: Share images and videos with guests to provide visual instructions or information.
2.4. Pricing & Availability: Driving Your Revenue
Nightly Price: Set and adjust the base nightly rate.
Custom Pricing: Set custom prices for specific dates, weekends, or holidays.
Discounts: Offer weekly or monthly discounts to attract longer-term stays.
Additional Fees: Add and manage fees for cleaning, extra guests, and pets.
2.5. Multi-Platform Payment Gateway Integration
The system will provide customers with a secure and flexible payment portal supporting the following South African payment providers:
Ozow: For instant Electronic Funds Transfer (EFT).
QR Code Payments:
Zapper
SnapScan
PayFast: To handle a variety of payment methods including credit/debit cards and other local options.
2.6. Dual-Channel Owner Notification System
To ensure the property owner is always informed, the system will send instant notifications upon a successful booking via two channels:
Email Notification: An email will be sent to the owner's registered address containing all booking details.
SMS Notification: A text message will be sent to the owner's registered mobile number with a concise summary of the new booking.
2.7. Customer Data Management
The system will securely store essential customer data for confirmed bookings in compliance with privacy regulations like POPIA. Stored data includes:
Customer's Full Name
Email Address
Contact Phone Number
Date of Visit (Check-in and Check-out)
Booking History
2.8. Performance & Earnings: Tracking Your Success
Performance Dashboard: A comprehensive dashboard providing an overview of views, bookings, and overall performance.
Occupancy & Reservation Rates: Track occupancy rates and booking conversion.
Guest Reviews: Read and respond to guest reviews to build reputation and gather feedback.
Earnings Summary: A clear and detailed breakdown of past and future earnings.
Transaction History: Access a complete history of all transactions and payouts.
Payout Methods: Manage and update preferred payout methods.
2.9. Automated Post-Stay Rating System
Automatic Trigger: The system will automatically detect when a customer's stay has concluded.
Feedback Request: Shortly after check-out (e.g., 24 hours), an automated email will be sent to the customer inviting them to leave a rating and a review.
Public Display: The customer's rating and review will be displayed on the relevant accommodation listing to build trust with future customers.
3. Functional Requirements & User Flow
3.1. Customer Booking Flow
Browse: The customer visits the website and browses the available accommodation listings.
Select Dates: The customer selects their desired dates on the interactive calendar.
Enter Details: The customer enters their personal details (Name, Email, Phone Number).
Proceed to Payment: The customer is redirected to a secure payment page with options for Ozow, Zapper, SnapScan, and PayFast.
Make Payment: The customer completes the payment.
Confirmation: Upon successful payment, the system:
Confirms the booking internally.
Sends a confirmation email to the customer with all booking details.
Triggers the owner notification process.
Updates the availability calendar in real-time.
3.2. Property Owner Experience
Receive Notification: The owner receives an instant email and SMS about the new booking.
View Dashboard: The owner can log into their dashboard to see the updated calendar, booking details, customer information, and payment status.
Manage Operations: The owner uses the suite of tools to manage listings, pricing, and communication.
3.3. Post-Stay Flow
System Check: The system identifies that a guest's check-out date has passed.
Automated Email: An email is automatically dispatched to the guest with a direct link to a review page.
Guest Review: The guest leaves a star rating and writes a review.
Review Published: The review is automatically published to the accommodation's page.
4. Non-Functional Requirements
Security: All payment processing will be handled by certified PCI-compliant gateways. Customer data will be encrypted both in transit and at rest.
Reliability: The system must have a high uptime (e.g., 99.9%) to ensure bookings and notifications are never missed.
Performance: The website and booking engine must be fast and responsive, with page load times under 2 seconds.
Scalability: The platform must be built to handle a growing number of listings and bookings without a degradation in performance.