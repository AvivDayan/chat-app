const socket=io();

const $messageForm=document.querySelector('#sendMessageForm');
const $messageInput=$messageForm.querySelector("input");
const $messageFormButton=$messageForm.querySelector('button');
const $sendLocationButton=document.querySelector('#send-location');
const $messages=document.querySelector("#messages");

const messageTemplate=document.querySelector("#message-template").innerHTML;
const locationTemplate=document.querySelector('#location-template').innerHTML;

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
        message:message.text,
        createdAt:moment(message.createdAt).format("D/M/YY H:mm:ss")
    });
    $messages.insertAdjacentHTML("beforeend",html);
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
    },undefined,{enableHighAccuracy:true})
})

socket.on('locationMessage',(locationMessage)=>{
    const html=Mustache.render(locationTemplate,{
        url:locationMessage.url,
        createdAt:moment(locationMessage.createdAt).format("D/M/YY H:mm:ss")
    });
    $messages.insertAdjacentHTML('beforeend',html);
})