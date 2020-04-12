const socket=io();

//Elements
const $messageForm=document.querySelector('#sendMessageForm');
const $messageInput=$messageForm.querySelector("input");
const $messageFormButton=$messageForm.querySelector('button');
const $sendLocationButton=document.querySelector('#send-location');
const $messages=document.querySelector("#messages");

//Templates
const messageTemplate=document.querySelector("#message-template").innerHTML;
const locationTemplate=document.querySelector('#location-template').innerHTML;
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML;

//Options
const{username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});

const autoScroll=()=>{
    //New message element
    const $newMessage=$messages.lastElementChild;

    //Height of new message
    const newMessageStyles=getComputedStyle($newMessage);
    const newMessageMargin=parseInt(newMessageStyles.marginBottom);
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin;

    //Visible height
    const visibleHeight=$messages.offsetHeight

    //Height of massages container
    const containerHeight=$messages.scrollHeight

    //How far have i scrolled?
    const scrollOffset=$messages.scrollTop+visibleHeight

    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight;
    }
}

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const msg=$messageInput.value;
    if(msg){
        $messageFormButton.setAttribute('disabled','disabled');
        socket.emit("message",msg,(error)=>{
            $messageFormButton.removeAttribute('disabled')
            $messageInput.value='';
            if(error){
                return console.log(error);
            }
            console.log("Message delivered");
        });
    }
})

socket.on('message',(message)=>{
    console.log(message.text);
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format("D/M/YY H:mm:ss")
    });
    $messages.insertAdjacentHTML("beforeend",html);
    autoScroll();
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.');
    }
    $sendLocationButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        const {latitude,longitude}=position.coords;
        socket.emit('locationMessage',latitude,longitude,()=>{
            $sendLocationButton.removeAttribute('disabled');
            console.log("Location shared!");
        });
    },(error)=>{
        $sendLocationButton.removeAttribute('disabled');
        console.log("Something went wrong, location wasnt shared!",error);
    },{enableHighAccuracy:true})
})

socket.on('locationMessage',(locationMessage)=>{
    const html=Mustache.render(locationTemplate,{
        username:locationMessage.username,
        url:locationMessage.url,
        createdAt:moment(locationMessage.createdAt).format("D/M/YY H:mm:ss")
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error);
        location.href='/'
    }
});

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML=html;
})