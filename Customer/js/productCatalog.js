productCatalogJS = {

   getProductById : function(productId){
   	var productCatalog = JSON.parse(localStorage.getItem("products")).products;
   	for(var product of productCatalog){
   		if(product.id == productId){
   			return product;
   		}
   	}
   }

};