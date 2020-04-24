const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const file = document.getElementById('myfile');



//Getting username and room name
const {username , room } = Qs.parse(location.search, {
    ignoreQueryPrefix : true
});

const socket = io();


//join chatrooms
socket.emit('joinRoom', {username, room});

//Getting room and users info from server page
socket.on('roomUsers',({room, users})=>{
    outputRoomName(room);
    outputUsers(users);
})

//Message from server
socket.on('message', message=>{
    console.log(message);
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//file uploading here
file.addEventListener('change', ()=>{
    if(!file.files.length){
        return;
    }
    var firstFile = file.files[0];
    var reader = new FileReader();
    reader.onloadend = function(){
        socket.emit('upload-image',{
            name: firstFile.name,
            size: firstFile.size,
            data: reader.result
        });
    };
    reader.readAsArrayBuffer(firstFile);
});
socket.on('image-uploaded',(message)=>{
    var img = document.createElement('img');
    img.classList.add('message');
    img.setAttribute('src', message.name);
     img.setAttribute('height', '100px');
     chatMessages.appendChild(img);
     chatMessages.scrollTop = chatMessages.scrollHeight;
});


chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    //getting msg text
    const msg = e.target.elements.msg.value;
    //emitting message to server
    socket.emit('chatMessage',msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

//Outputting the message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room){
    roomName.innerText = room;
}

//add users on the list on DOM
function outputUsers(users){
    userList.innerHTML = `
        ${users.map(user=> `<li>${user.username}</li>`).join('')}
    `;
}
