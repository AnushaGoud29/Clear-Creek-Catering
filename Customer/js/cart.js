cartJS = {


     addToCart: function(productId) {
       var orderObject;	
       const orderKey = "orderDetails";
       var orderStr = localStorage.getItem(orderKey);
       if(orderStr){ // If item found, increase the qty. Otherwise add the item to the existing list
          orderObject = JSON.parse(orderStr);
          if(orderObject[productId]){
          	orderObject[productId].qty = parseInt(orderObject[productId].qty) + 1;
          }
          else{
          	orderObject[productId] = { "productId" : productId, "qty" : 1 };
          }
       }
       else
       {
       	 orderObject = {};
       	 orderObject[productId] = { "productId" : productId, "qty" : 1 };
       }
         localStorage.setItem(orderKey, JSON.stringify(orderObject));
     },

     removeFromCart: function(productId){
		const orderKey = "orderDetails";
		var orderStr = localStorage.getItem(orderKey);
		var orderJson = JSON.parse(orderStr);
		delete orderJson[productId];
		localStorage.setItem(orderKey, JSON.stringify(orderJson));
		location.reload();
     },

     updateCart: function(productId, qty){
		const orderKey = "orderDetails";
		var orderStr = localStorage.getItem(orderKey);
		var orderJson = JSON.parse(orderStr);
		orderJson[productId].qty = parseInt(qty);
		localStorage.setItem(orderKey, JSON.stringify(orderJson));
		location.reload();
     },

     fetchOrder: function(){
       const orderKey = "orderDetails";
        var orderStr = localStorage.getItem(orderKey);
        if(orderStr){
             cartJS.populateOrderInCart(JSON.parse(orderStr));
        }
     },

     populateOrderInCart : function(orderDetails){
     	   var orderDetailsHTML = '';
     	   var totalPrice = 0.0;
           for(var key in orderDetails){
           	  var productFromCatalog = productCatalogJS.getProductById(key);
              orderDetailsHTML = orderDetailsHTML + '<tr class="woocommerce-cart-form__cart-item cart_item">';
              orderDetailsHTML = orderDetailsHTML + '<td class="product-thumbnail"></td>'; 
              orderDetailsHTML = orderDetailsHTML + '<td class="product-name" data-title="Product">'+ productFromCatalog.name + '</td>';
              orderDetailsHTML = orderDetailsHTML + '<td class="product-price" data-title="Price"> <span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">$</span>'+productFromCatalog.price.toFixed(2)+ '</bdi></span> </td>';
              orderDetailsHTML = orderDetailsHTML + '<td class="product-quantity" data-title="Quantity"> <div class="quantity"> <input type="number" id="quantity_6296a43bc7c61" class="input-text qty text" step="1" min="1" max="" oninput="cartJS.updateCart('+key+ ', this.value)" name="cart[ee348d0627b55d18ca6c0b8ba4831d05][qty]" value="'+ orderDetails[key].qty + '" title="Qty" size="4" placeholder="" inputmode="numeric"> </div> </td>';
              orderDetailsHTML = orderDetailsHTML + '<td class="product-remove"><div onclick="cartJS.removeFromCart('+key+')" style="cursor:pointer"><i class="fa-sharp fa-solid fa-trash"></i></div></td>';
              orderDetailsHTML = orderDetailsHTML + '<td class="product-subtotal" data-title="Subtotal"> <span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">$</span>'+ (orderDetails[key].qty * productFromCatalog.price).toFixed(2) +'</bdi></span> </td>';            
              orderDetailsHTML = orderDetailsHTML + '</tr>';
              totalPrice = totalPrice + (orderDetails[key].qty * productFromCatalog.price);
           }
           $("#orderMain tbody").prepend(orderDetailsHTML);
           $(".total .price").html(totalPrice.toFixed(2));
     }
   
};
