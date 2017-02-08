
function modal() {
  document.querySelectorAll("[data-modal]:not([data-modal=''])").forEach(function(elem) {
    var id = elem.getAttribute('data-modal');
    elem.onclick = function() {
      var modals = document.querySelectorAll('.modal');
      modals.forEach(function(modal) { modal.style.display = "none"; });
      document.getElementById(id).style.display = "block";
    }
  });
  document.querySelectorAll('.modal').forEach(function(elem) {
    elem.querySelector('span.close').onclick = function() {
      elem.style.display = 'none';
    };
  });
}

modal.show = function(id) {
  var modals = document.querySelectorAll('.modal');
  modals.forEach(function(elem) {
    if (elem.style.display == "block")
      modal.hide(elem);
  });
  var elem = document.getElementById(id);
  elem.style.display = "block";
};

modal.hide = function(elem) {
  elem.style.display = "none";
};

window.onclick = function(event) {
  document.querySelectorAll('.modal').forEach(function(elem) {
    if (event.target == elem)
      modal.hide(elem);
  });
};

window.onkeydown = function(event) {
  if (event.keyCode == 27) {
    document.querySelectorAll('.modal').forEach(function(elem) {
      if (elem.style.display == 'block')
        modal.hide(elem);
    });
  }
};

document.addEventListener("DOMContentLoaded", function(event) {
  modal(); // update modal event handlers
});