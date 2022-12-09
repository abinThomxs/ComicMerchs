/* eslint-disable no-restricted-globals */
/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable radix */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function changeQuantity(cartId, productId, count) {
  $.ajax({
    url: '/user/cartQuantity',
    data: {
      cart: cartId,
      product: productId,
      count,
    },
    method: 'post',
    success: (res) => {
      // document.getElementById('quantity').innerText = Number(qty) + Number(count);
      location.reload();
      // $('#quantity').load(`${document.URL} #quantity`);
    },
  });
}

function deleteProduct(cartId, productId) {
  $.ajax({
    url: '/user/deleteProduct',
    data: {
      cart: cartId,
      product: productId,
    },
    method: 'post',
    success: () => {
      location.reload();
    },
  });
}
