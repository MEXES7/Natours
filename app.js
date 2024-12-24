const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
// const Tour = require('./models/tourModel');
// const stripe = require('stripe')(
//   'sk_test_51QIC8EIyNOCKl26nrg33bUs0uLDosyUTJVzIZy8Ic4gkbAYxRIWADTfbA7LzyxMYdf6yvy0drMuWRc7RXnGYVnCr00PSAUmc5e'
// );
// app.post('/create-checkout-session', async (req, res) => {
//   const tour = Tour.findById(req.params.tourId);
//   const session = await stripe.checkout.sessions.create({
//     line_items: [
//       {
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: tour.name,
//             images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
//           },
//           unit_amount: tour.price * 100
//         },
//         quantity: 1
//       }
//     ],
//     mode: 'payment',
//     success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
//       req.params.tourId
//     }&user=${req.user.id}&price=${tour.price}`,
//     cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
//     customer_email: req.user.email,
//     client_reference_id: req.params.tourId
//   });

//   console.log(session);

//   res.status(200).json({
//     status: 'success',
//     session
//   });
// });

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
