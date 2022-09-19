// import { initializeApp } from '../../node_modules/@firebase/app';

// import { getFirestore, collection, getDocs } from '../../node_modules/@firebase/firestore/lite';
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOIvfuATzcgDaO6YB1nBLcMUucm8hYa4M",
  authDomain: "clear-creek-catering.firebaseapp.com",
  // The value of `databaseURL` depends on the location of the database
  databaseURL: "https://clear-creek-catering.firebaseio.com",
  projectId: "clear-creek-catering",
  storageBucket: "gs://clear-creek-catering.appspot.com",
  messagingSenderId: "167084086844",
  // appId: "APP_ID",
  // For Firebase JavaScript SDK v7.20.0 and later, `measurementId` is an optional field
  //  measurementId: "G-MEASUREMENT_ID",
};
// const app = firebase.initializeApp(firebaseConfig);
// const db = getFirestore(app);

// Get a list of cities from your database
async function getUsers(db) {
  const citiesCol = collection(db, 'USERS');
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map(doc => doc.data());
  return cityList;
}

function showLoader() {
  $('#loader').show();
  $('body').css('opacity', '0.3');
}

function hideLoader() {
  $('#loader').hide();
  $('body').css('opacity', 1);
}

function logout() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem("displayname");
  sessionStorage.removeItem("currentUser");
  // sessionStorage.removeItem("currentFood");
  // $('div#navLogin').css('display','block');
  // $('div#currentUserSection').css('display','none');
  const auth = getAuth(firebaseApp);
  showLoader();
  signOut(auth).then(() => {
    $('div#navLogin').css('display', 'block');
    $('div#currentUserSection').css('display', 'none');
    hideLoader();
  }).catch((error) => {
    $('div#navLogin').css('display', 'block');
    $('div#currentUserSection').css('display', 'none');
    hideLoader();
  });
  $('#adminNav').css('display','none');
}

$('#logout').on('click', function () {
  logout();
  pageReload();
});

function clearSignForm() {
  $('#email').val('');
  $('#password').val('')
}

$('#loader').hide();
let dpName = sessionStorage.getItem("displayname");
if(dpName =='admin'){
  $('#adminNav').css('display','block');
}else{
  if(location.href.indexOf('adminOrders')>=0){

    location.href ="/Customer"
  }

  $('#adminNav').css('display','none');
}
function pageReload() {
  if (window.location.href.indexOf('customize') == -1) {
    window.location.reload();
  }
}
$('#signIn').on('click', function () {
  showLoader();
  const auth = getAuth(firebaseApp);
  signInWithEmailAndPassword(auth, $('#email').val(), $('#password').val())
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      sessionStorage.setItem('token', user.accessToken);
      sessionStorage.setItem("displayname", user.displayName);
      sessionStorage.setItem('currentUser', JSON.stringify(auth.currentUser))
      if (user.accessToken && user.displayName) {
        $('div#navLogin').css('display', 'none');
        $('div#currentUserSection').css('display', 'block');
        $('#currentUser').html(user.displayName);
      }
      if(user.displayName == 'admin'){
        $('#adminNav').css('display','block');
      }
      clearSignForm();
      $("#BookingModalSignin").modal('hide');
      console.log(user);
      hideLoader();
      pageReload();
      // ...
    })
    .catch((error) => {
      $('div#navLogin').css('display', 'block');
      $('div#currentUserSection').css('display', 'none');
      hideLoader();
      if (error.code == 'auth/user-not-found') {
        console.log("User not found");
      }
      const errorCode = error.code;
      const errorMessage = error.message;
    });
});

function clearSignupForm() {
  $('#fname').val('');
  $('#sphone').val('');
  $('#peopleCount').val('');
  $('#dateBirth').val('');
  $('#stime').val('');
  $('#spassowrd').val('');
  $('#scpassowrd').val('');
  $('#semail').val('');

}

$('#signup').on('click', function () {
  const auth = getAuth(firebaseApp);
  let fname = $('#fname').val();
  let sphone = $('#sphone').val();
  let peopleCount = $('#peopleCount').val();
  let dateBirth = $('#dateBirth').val();
  let stime = $('#stime').val();
  let spassowrd = $('#spassowrd').val();
  let scpassowrd = $('#scpassowrd').val();
  let semail = $('#semail').val();


  if (scpassowrd !== scpassowrd) {
    console.log("Password and confirm password missmatch");
    return;
  }
  showLoader();
  createUserWithEmailAndPassword(auth, semail, spassowrd)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      updateProfile(user, {
        displayName: fname,
        photoURL: "",
        phoneNumber: sphone,
        dateofbirth: dateBirth,
        peopleCount: peopleCount,
        dobTime: stime


      }).then(async () => {

        await setDoc(doc(firbasedb, "USERS", user.uid), {
          phoneNumber: sphone,
          dateofbirth: dateBirth,
          peopleCount: peopleCount,
          dobTime: stime,
          fname: fname,
          email: semail

        });

        hideLoader();
        // Profile updated!
        $('#infoMsg').html("User created successfully! Please login");
        clearSignupForm();


        // ...
      }).catch((error) => {
        hideLoader();
        // An error occurred
        // ...
      });

      // ...
    })
    .catch((error) => {
      hideLoader();
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
});

function clearOrderForm() {
  $('#nameOnCard').val('');
  $('#cardNumber').val('');
  $('#cardEmail').val('');
  $('#billAddress').val('');
}
$('#orderProceed').on('click', async function () {
  let cardName = $('#nameOnCard').val();
  let cardNumber = $('#cardNumber').val();
  let email = $('#cardEmail').val();
  let billingAddres = $('#billAddress').val();

  if (!cardName || !cardNumber) {
    return;
  }
  showLoader();

  const cuser = getCurrentUser();
  if (cuser) {
    const docRef = doc(firbasedb, "cart", cuser.uid);
    const docSnap = await getDoc(docRef);
    let docData = docSnap.data();
    const orderItems = doc(firbasedb, "Orders", cuser.uid);
    const orderDocsnap = await getDoc(orderItems);
    let orders = orderDocsnap.data();
    if(!orders){
      orders ={}
    }
    if(!orders.items){
      orders.items  =[];
    }
      setDoc(orderItems, {
        items: orders.items.concat(docData.items),
        cardInfo:{
          cardName:cardName,
          cardNumber:cardNumber,
          email:email,
          billingAddres:billingAddres,
          cname:cuser.displayName,
          cemail:cuser.email,
          uid:cuser.uid
        }
      });
      const cartItems = doc(firbasedb, "cart", cuser.uid);
      setDoc(cartItems, {
        items: []
      });
      $('#orderSuccess').show();
      clearOrderForm();

  }

  hideLoader();

});
function getCurrentUser() {
  let currentUser = sessionStorage.getItem('currentUser');
  return JSON.parse(currentUser);
}


async function getCartItems(page, tblName) {
  const cuser = getCurrentUser();
  showLoader();
  if (cuser) {
    
    const docRef = doc(firbasedb, (tblName || "cart"), cuser.uid);
    const docSnap = await getDoc(docRef);
    let docData = docSnap.data();
    let trows = '';
    let totalPrice = 0;
    if(page == 'adminorders'){
  //  let use =   getAuth(firebaseApp)
  //.getUser(cuser.uid);
      const adminOrders = collection(firbasedb, tblName);
     const adminOrdersSnapshot = await getDocs(adminOrders);
      const adminOrdersList = adminOrdersSnapshot.docs.map(doc => doc.data());

      if(adminOrdersList){
        let tr ='';
        window.orderStatusChange = async function(thisDoc, index, orderIndex){
          showLoader();
          let selectedOrderC = adminOrdersList[index];
          if(selectedOrderC.items && selectedOrderC.items.length){
            let orderSelected = selectedOrderC.items[orderIndex];
            orderSelected.status = $(thisDoc).val();
          }
          // adminOrdersList.map(async (or, idex)=>{

            const orderItems = doc(firbasedb, "Orders", selectedOrderC.cardInfo.uid);
            // const orderDocsnap = await getDoc(orderItems);
            // let orders = orderDocsnap.data();
            // if(!orders){
            //   orders ={}
            // }
            // if(!orders.items){
            //   orders.items  =[];
            // }
            await  setDoc(orderItems, {
                items: selectedOrderC.items,
                cardInfo:selectedOrderC.cardInfo
              });
              hideLoader();
              alert(selectedOrderC.cardInfo.cname+" Order "+  $(thisDoc).val());

          // });
          // let selectedOrder = adminOrdersList[index];
        }
        let statsList = [
          {status:"Pending", id:1},
          {status:"Delivered", id:2},
          {status:"Accepted", id:3},
        ];
        adminOrdersList.map((or, indx)=>{
          let cardDetails  = or.cardInfo;
          if(!or.items){
            or.items = [];
          }
          or.items.map((itm,index)=>{
            itm.orderId = `${index}${itm.id}`;
            tr += `
              <tr>
              <td>${index}${itm.id}</td>
              <td>${itm.name}</td>
              <td>${cardDetails.cname || cardDetails.cardName}</td>
              <td>${itm.quantity}</td>
              <td>$${itm.price}</td>`;
            
              let statustd =`<td><select onchange='orderStatusChange(this, ${indx}, ${index})' name="statuses" id="status-${index}">`;
              statsList.map(st=>{
                if(!itm.status){
                  itm.status = 'Pending'
                }
                if(st.status == itm.status ){
                  statustd += `<option selected value="${st.status}">${st.status} </option>`;
                }else{

                  statustd += `<option value="${st.status}">${st.status} </option>`;
                }
              });

              statustd += `</select></td>
              <td>Card</td>
              </tr>
            `;
            tr += statustd;
            return itm;
          });
        });

        $('#adminOrders tbody').html(tr);
        console.log(adminOrdersList);
      }
    }
    else if (page == 'orders') {
      docData.items.map(row => {
        let totalPriceWithToping = 0;
        if(row.topings && row.topings.length){
          totalPriceWithToping =  row.topings.reduce((acc, curr, index)=>{
            return acc+ (+curr.price);
          }, 0);
        }
        trows += `
      <div class="d-flex mb-lg-1">
      <p>${row.name} </p>
      <p class="ms-5">$ ${row.price + totalPriceWithToping} </p>
    </div>`
        totalPrice += row.quantity * (row.price+ totalPriceWithToping);
        return row;
      });

      $('#orderDetails').html(trows);
      $('#orderTotal').html('$ ' + totalPrice);
    } else {
      if(!docData){
        docData = {
          items:[]
        };
      }
      docData.items.map(row => {
        let totalPriceWithToping = 0;
        if(row.topings && row.topings.length){
          totalPriceWithToping =  row.topings.reduce((acc, curr, index)=>{
            return acc+ (+curr.price);
          }, 0);
        }
        trows += `<tr>
        <td>${row.name}</td>
        <td>$ ${row.price + totalPriceWithToping}</td>
        <td>${row.quantity}</td>`;
        if(page == 'myorders'){
          trows += ` <td>${row.status ? row.status  :'Pending'}</td>`;
        }
        trows +=  `<td>$${row.quantity * (row.price + totalPriceWithToping)}</td>
    </tr>`;
        totalPrice += row.quantity * (row.price+totalPriceWithToping);
        return row;
      });
      $('#customers_cart tbody').html(trows);
      $('#totalPrice').html(totalPrice);

      console.log(docSnap.data());
    }
  } else {

    setTimeout(()=>{

      window.$("#BookingModalSignin").modal('show');
    }, 300);
    logout();
  }
  hideLoader();
  // const cartsCol = collection(firbasedb, 'cart');
  // const cartsSnapshot = await getDocs(cartsCol);
  // const cartsList = cartsSnapshot.docs.map(doc => doc.data());
  // return cartsList;
}

function logoutAndShowLogin(){
  setTimeout(()=>{

    window.$("#BookingModalSignin").modal('show');
  }, 300);
  logout();
}
async function addToCart(thisDoc, id, name, price, topings) {
  const cuser = getCurrentUser();
  showLoader();
  if (cuser) {
    const docRef = doc(firbasedb, "cart", cuser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.data()) {
      const cartItems = doc(firbasedb, "cart", cuser.uid);
      await updateDoc(cartItems, {
        items: arrayUnion({
          id: id,
          name: name,
          price: price,
          quantity: 1,
          topings: topings || []
        })
      });
    }
    else {
      const cartItems = doc(firbasedb, "cart", cuser.uid);
    await  setDoc(cartItems, {
        items: arrayUnion({
          id: id,
          name: name,
          price: price,
          quantity: 1,
          topings: topings|| []
        })
      })
    }
    // await setDoc(doc(firbasedb, "cart", cuser.uid),  {
    //   id: id,
    //   name: name,
    //   price:price,
    //   quantity:1
    // });
    if(thisDoc){
      $(thisDoc).hide();
      $('<button type="button"><i class="bi bi-cart-check"></i></button>').insertAfter($(thisDoc));

    }
  } else {
    logoutAndShowLogin();
  }
hideLoader();
  // const docRef = await addDoc(collection(firbasedb, "cart"), {
  //   id: id,
  //   name: name,
  //   price:price,
  //   quantity:1
  // });
  console.log('cart added');
}



function prepareFood(thisDoc, id, name, price){
  
  let currentFoodPrep ={
    id:id,
    name,
    price
  }
  sessionStorage.setItem('currentFood', JSON.stringify(currentFoodPrep));

  location.href= '/Customer/customize.html'
}

async function geCustomeItemsForFood(){
  let currentFood = sessionStorage.getItem('currentFood');
  currentFood = JSON.parse(currentFood);

 $('#itemname').html(currentFood.name);
 $('#quantity').html(1);
 $('#price').html(currentFood.price);

 const toppings = doc(firbasedb, "Toppings", currentFood.name);
 const docSnap = await getDoc(toppings);
let currentTopingData = docSnap.data();
//  const toppings = collection(firbasedb, 'Toppings');
//  const toppingsSnapshot = await getDocs(toppings);
//  const toppingData = toppingsSnapshot.docs.map(doc => doc.data());

let trow = '';
currentTopingData.toppings.map((topng, index)=>{
  topng.id = index+1;
  trow += `
      <tr>
      <td class="product-thumbnail">
        <input type="checkbox" name="" onclick='selectToping(this, ${JSON.stringify(topng)})'/></td>
      <td class="product-name" data-title="Product">${topng.toping}</td>
      <td class="product-price" data-title="Price"> <span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">$</span>${topng.price}</bdi></span> </td>
        </tr>`;

        return topng;
});

$('#customize_cart tbody').html(trow);

$('#totalPrice').html(currentFood.price);
  
  // console.log(toppingData);
}

let selectedTopings = [];
function selectToping(thisEle, toping){
  if(thisEle.checked){
    selectedTopings.push(toping);
    $('#totalPrice').html(+($('#totalPrice').text()) + +(toping.price));
  }else{
    selectedTopings = selectedTopings.filter(tp=>{
      return tp.id != toping.id;
    })
    $('#totalPrice').html(+($('#totalPrice').text()) - +(toping.price));
  }
// console.log(toping);
}


$('#cartCheckout').on('click', async function(){
  const cuser = getCurrentUser();
  if (cuser) {

    let currentFood = sessionStorage.getItem('currentFood');
    currentFood = JSON.parse(currentFood);
    currentFood.selectedTopings = selectedTopings;
  await addToCart(null, currentFood.id, currentFood.name, currentFood.price, selectedTopings);

    location.href = '/Customer/cart.html';
  } else{
    logoutAndShowLogin();
  }

});



