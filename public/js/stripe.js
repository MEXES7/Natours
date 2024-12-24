/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51QIC8EIyNOCKl26n71fLtlddATPK8LsPSCJR7WVTfb9OQnBmp2caz3oYX3IQMYFyk0hjGC6zYVX99wjey5Ug8bJS00i19pBu86'
);

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
// export const bookTour = async () => {
//   try {
//     const res = await axios({
//       method: 'POST',
//       url: 'http://127.0.0.1:3000/api/v1//create-checkout-session'
//     });
//     if ((res.data.status = 'success')) location.reload(true);
//   } catch (err) {
//     console.log(err.response);
//     showAlert('error', 'Error logging out! Try again.');
//   }
// };
