// Função para preencher a lista de eventos na view "event-list"
function fillEventList(events) {
  const eventList = document.getElementById('event-list');
  eventList.innerHTML = '';

  events.forEach(event => {
    const eventItem = document.createElement('div');
    eventItem.classList.add('event-item');
    eventItem.id = `event-${event._id}`;

    const title = document.createElement('h2');
    title.textContent = event.title;

    const description = document.createElement('p');
    description.textContent = event.description;

    const location = document.createElement('p');
    location.textContent = event.location;

    const startDate = document.createElement('p');
    startDate.textContent = 'Data de Início: ' + event.startDate;

    const endDate = document.createElement('p');
    endDate.textContent = 'Data de Término: ' + event.endDate;

    eventItem.appendChild(title);
    eventItem.appendChild(description);
    eventItem.appendChild(location);
    eventItem.appendChild(startDate);
    eventItem.appendChild(endDate);

    eventList.appendChild(eventItem);
  });
}


  addLikeButton(); // Adiciona o botão "Like" após preencher a lista de eventos


// Função para exibir o mapa na view "map"
function displayMap(location) {
  const mapDiv = document.getElementById('map');
  mapDiv.innerHTML = '';

  const mapOptions = {
    zoom: 12,
    center: location,
  };

  const map = new google.maps.Map(mapDiv, mapOptions);

  const marker = new google.maps.Marker({
    position: location,
    map: map,
  });
}

// Função para lidar com o envio do formulário de evento
function handleEventFormSubmit(event) {
  event.preventDefault();

  // Obter os valores dos campos do formulário
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const location = document.getElementById('location').value;

  // Criar um objeto de evento com os valores
  const eventObject = {
    title: title,
    description: description,
    startDate: startDate,
    endDate: endDate,
    location: location,
  };

  // Obter a localização geográfica usando a API de Geocodificação do Google Maps
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: location }, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        // Acessar as coordenadas geográficas
        const locationLatLng = results[0].geometry.location;

        // Adicionar as coordenadas geográficas ao objeto de evento
        eventObject.latitude = locationLatLng.lat();
        eventObject.longitude = locationLatLng.lng();

        // Aqui você pode enviar os dados do evento para a API (por exemplo, usando fetch ou Axios)
        // Exemplo de uso do fetch:
        fetch('/api/event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventObject),
        })
          .then(response => response.json())
          .then(newEvent => {
            console.log('Evento criado:', newEvent);
            // Você pode atualizar a lista de eventos aqui ou executar outras ações necessárias
          })
          .catch(error => {
            console.error('Erro ao criar o evento:', error);
          });

        // Limpar os campos do formulário após o envio
        document.getElementById('event-form').reset();
      }
    } else {
      console.error('Erro ao obter a localização:', status);
    }
  });
}
