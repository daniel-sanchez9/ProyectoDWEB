(function ($) {
    "use strict";

    // MENU
    $('.navbar-collapse a').on('click',function(){
        $(".navbar-collapse").collapse('hide');
    });
    
    // CUSTOM LINK
    $('.smoothscroll').click(function(){
        var el = $(this).attr('href');
        var elWrapped = $(el);
        var header_height = $('.navbar').height();
  
        scrollToDiv(elWrapped,header_height);
        return false;
  
        function scrollToDiv(element,navheight){
            var offset = element.offset();
            var offsetTop = offset.top;
            var totalScroll = offsetTop-navheight;
  
            $('body,html').animate({
                scrollTop: totalScroll
            }, 300);
        }
    });

    $(window).on('scroll', function(){
        function isScrollIntoView(elem, index) {
            var docViewTop = $(window).scrollTop();
            var docViewBottom = docViewTop + $(window).height();
            var elemTop = $(elem).offset().top;
            var elemBottom = elemTop + $(window).height()*.5;
            if(elemBottom <= docViewBottom && elemTop >= docViewTop) {
                $(elem).addClass('active');
            }
            if(!(elemBottom <= docViewBottom)) {
                $(elem).removeClass('active');
            }
            var MainTimelineContainer = $('#vertical-scrollable-timeline')[0];
            var MainTimelineContainerBottom = MainTimelineContainer.getBoundingClientRect().bottom - $(window).height()*.5;
            $(MainTimelineContainer).find('.inner').css('height',MainTimelineContainerBottom+'px');
        }
        var timeline = $('#vertical-scrollable-timeline li');
        Array.from(timeline).forEach(isScrollIntoView);
    });

    // Restricción de horas hábiles
$('#fecha').on('change', function() {
    var fechaSeleccionada = new Date($(this).val());
    var hora = fechaSeleccionada.getHours();
    // Restringe las horas fuera del rango de 9:00 a 17:00
    if (hora < 9 || hora >= 17) {
        // Mostrar alerta personalizada con SweetAlert2
        Swal.fire({
            icon: 'warning',
            title: 'Hora fuera de rango',
            text: 'Por favor, selecciona una hora entre las 9:00 y las 17:00.',
            confirmButtonColor: '#7e0cf5'
        }).then((result) => {
            // Si el usuario hace clic en el botón de confirmación, limpiar el campo de fecha y hora
            if (result.isConfirmed) {
                $('#fecha').val('');
            }
        });
    }
});

$('#email').on('focusout', function() {
    var email = $('#email').val();
    if (!isValidEmail(email)) {
        // Mostrar alerta personalizada con SweetAlert2
        Swal.fire({
            icon: 'error',
            title: 'Correo Electrónico Inválido',
            text: 'Por favor, introduce una dirección de correo electrónico válida.',
            confirmButtonColor: '#7e0cf5'
        });
    }
});


// Función para validar un correo electrónico
function isValidEmail(email) {
    // Utiliza una expresión regular para validar el formato del correo electrónico
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}
	
	// funciones para las Torres y Apartamentos
	
	var apartamentosPorTorre = {
    '1': ['101', '102', '103', '104', '105', '106', '201', '202', '203', '204', '205', '206', '301', '302', '303', '304', '305', '306', '401', '402', '403', '404', '405', '406', '501', '502', '503', '504', '505', '506', '601', '602', '603', '604', '605', '606'],
		
    '2': ['101', '102', '103', '104', '105', '106', '201', '202', '203', '204', '205', '206', '301', '302', '303', '304', '305', '306', '401', '402', '403', '404', '405', '406', '501', '502', '503', '504', '505', '506', '601', '602', '603', '604', '605', '606'],
		
    '3': ['101', '102', '103', '104', '105', '106', '201', '202', '203', '204', '205', '206', '301', '302', '303', '304', '305', '306', '401', '402', '403', '404', '405', '406', '501', '502', '503', '504', '505', '506', '601', '602', '603', '604', '605', '606'],
		
    '4': ['101', '102', '103', '104', '105', '106', '201', '202', '203', '204', '205', '206', '301', '302', '303', '304', '305', '306', '401', '402', '403', '404', '405', '406', '501', '502', '503', '504', '505', '506', '601', '602', '603', '604', '605', '606'],
		
    '5': ['101', '102', '103', '104', '105', '106', '201', '202', '203', '204', '205', '206', '301', '302', '303', '304', '305', '306', '401', '402', '403', '404', '405', '406', '501', '502', '503', '504', '505', '506', '601', '602', '603', '604', '605', '606'],
		
    '6': ['101', '102', '103', '104', '105', '106', '201', '202', '203', '204', '205', '206', '301', '302', '303', '304', '305', '306', '401', '402', '403', '404', '405', '406', '501', '502', '503', '504', '505', '506', '601', '602', '603', '604', '605', '606']
};

	
	// Función para generar las opciones de torre
    function generarOpcionesTorre() {
        var torres = ['1', '2', '3', '4', '5', '6'];
        torres.forEach(function(torre) {
            $('#torre').append('<option value="' + torre + '">' + torre + '</option>');
        });
    }

    // Función para generar las opciones de apartamento para la torre seleccionada
    function generarOpcionesApartamentos(torreSeleccionada) {
        // Limpiar las opciones actuales del selector de apartamento
        $('#apartamento').empty();
        
        // Obtener los apartamentos para la torre seleccionada
        var apartamentos = apartamentosPorTorre[torreSeleccionada];
        
        // Agregar las nuevas opciones según la torre seleccionada
        apartamentos.forEach(function(apto) {
            $('#apartamento').append('<option value="' + apto + '">' + apto + '</option>');
        });
    }

    // Ejecutar la función para generar las opciones de torre al cargar la página
    generarOpcionesTorre();

    // Ejecutar la función para generar las opciones de apartamento al seleccionar una torre
    $('#torre').change(function() {
        var torreSeleccionada = $(this).val();
        generarOpcionesApartamentos(torreSeleccionada);
    });
	

})(window.jQuery);

