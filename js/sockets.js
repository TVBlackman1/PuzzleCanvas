//инициализация подключения и слушателя действий оппонента
async function initializeSockets(puzzleworker){
    let uid = $(location).attr('href').split('/').pop();
    let token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    let response = await axios.get('/puzzle/info/room/'+uid+'?_token='+token);
    let room = response.data;
    let channel = Echo.private('room.' + room.uid);
    channel.listen('.client-move', (response) => {
        console.log("received" ,response);
        puzzleworker.push(response);
        puzzleworker.execute(arr); // arr - массив пазлов
    });
    return room;
}

//создаем по передаваемому фрагменту задание для воркера оппонента
function formExecutableTask(fragment, shouldConnectOnOtherSide) {
    return  {
        ind:fragment.ind,
        x:fragment.x,
        y:fragment.y,
        group:!!fragment.group,
        shouldConnect:shouldConnectOnOtherSide,
        onBottomPanel:fragment.onBottomPanel,
        onMenu:!!fragment.group ? fragment.group.onMenu : fragment.onMenu,
    };
}
