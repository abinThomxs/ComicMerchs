/* eslint-disable linebreak-style */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
/* eslint-disable radix */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function changeQuantity(cartId, productId, count) {
  $.ajax({
    url: '/cartQuantity',
    data: {
      cart: cartId,
      product: productId,
      count,
    },
    method: 'post',
    success: (res) => {
      // if (res.status) {
      //   document.getElementById(productId).innerHTML = Number(qty) + Number(count);
      // }

      location.reload();
      // $('#quantity').load(`${document.URL} #quantity`);
    },
  });
}

function deleteProduct(cartId, productId) {
  $.ajax({
    url: '/deleteProduct',
    data: {
      cart: cartId,
      product: productId,
    },
    method: 'post',
    success: () => {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success',
          );
        }
      }).then(() => {
        location.reload();
      });
    },
  });
}

// function deleteWish(wishId, productId) {
//   $.ajax({
//     url: '/user/deleteWishlist',
//     data: {
//       wishlistData: wishId,
//       product: productId,
//     },
//     method: 'post',
//     success: () => {
//       Swal.fire({
//         title: 'Are you sure?',
//         text: "You won't be able to revert this!",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, delete it!',
//       }).then((result) => {
//         if (result.isConfirmed) {
//           Swal.fire(
//             'Deleted!',
//             'Your file has been deleted.',
//             'success',
//           );
//         }
//       }).then(() => {
//         location.reload();
//       });
//     },
//   });
// }
