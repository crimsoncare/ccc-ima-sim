
function Application() {

  this.txtNumAttendings = document.getElementById('numAttendings');
  this.txtNumClinicalTeams = document.getElementById('numClinicalTeams');
  this.txtNumPatients = document.getElementById('numPatients');

  this.txtTargetTime = document.getElementById('targetTime');
  this.txtHurryThreshold = document.getElementById('hurryThreshold');
  this.txtHurryFactor = document.getElementById('hurryFactor');

  this.txtNumAttendings.onkeyup = this.showConfirmParams;
  this.txtNumClinicalTeams.onkeyup = this.showConfirmParams;
  this.txtNumPatients.onkeyup = this.showConfirmParams;

  this.prevResult = null;

}

Application.prototype.showConfirmParams = function() {
  document.getElementById('confirmParams').style.display = 'block';
};

Application.prototype.hideConfirmParams = function() {
  document.getElementById('confirmParams').style.display = 'none';
}

Application.prototype.createSession = function() {

  var self = this;

  this.hideConfirmParams();

  this.params = {

    numAttendings: parseInt(this.txtNumAttendings.value),
    numClinicalTeams: parseInt(this.txtNumClinicalTeams.value),
    numPatients: parseInt(this.txtNumPatients.value),

    targetTime: parseFloat(this.txtTargetTime),
    hurryThreshold: parseFloat(this.txtHurryThreshold),
    hurryFactor: parseFloat(this.txtHurryFactor),

    actors: {
      attendings: [ ],
      clinicalTeams: [ ],
      patients: [ ]
    },

    distributions: {
      pt_checkin:                { name: 'Patient check in',                          min:   2, max: 10, mean:  5, stdev:  2 },
      pt_arrival_delay:          { name: 'Patient arrival (relative to appointment)', min: -60, max: 60, mean: -6, stdev: 16 },
      pt_ct_meeting_btc_new:     { name: 'Patient-ClinicalTeam meeting (BTC New)',  min:  15, max: 75, mean: 40, stdev: 20 },
      pt_ct_meeting_btc_fu:      { name: 'Patient-ClinicalTeam meeting (BTC F/U)',  min:  15, max: 75, mean: 30, stdev: 15 },
      pt_ct_meeting_uc:          { name: 'Patient-ClinicalTeam meeting (UC)',       min:  15, max: 75, mean: 30, stdev: 15 },
      ct_atp_meeting:            { name: 'ClinicalTeam-Attending meeting',            min:   1, max: 25, mean: 10, stdev:  5 },
      pt_ct_atp_meeting_btc_new: { name: 'Patient-Attending meeting (BTC New)',       min:  15, max: 75, mean: 20, stdev: 15 },
      pt_ct_atp_meeting_btc_fu:  { name: 'Patient-Attending meeting (BTC F/U)',       min:   5, max: 60, mean: 15, stdev: 15 },
      pt_ct_atp_meeting_uc:      { name: 'Patient-Attending meeting (UC)',            min:   5, max: 60, mean: 15, stdev: 15 },
      pt_checkout:               { name: 'Patient check out',                         min:   1, max: 30, mean:  5, stdev:  7 },
    }

  };

  for (var i = 0; i < this.params.numAttendings; i++) {
    this.params.actors.attendings.push({
      id: 'Attending-' + (i + 1)
    });
  }

  for (var i = 0; i < this.params.numClinicalTeams; i++) {
    this.params.actors.clinicalTeams.push({
      id: 'ClinicalTeam-' + (i + 1)
    });
  }

  for (var i = 0; i < this.params.numPatients; i++) {
    this.params.actors.patients.push({
      id: 'Patient-' + (i + 1),
      preferredAttending: '',
      preferredClinicalTeam: '',
      caseType: 'uc',
      maxWaitTimeAttending: 15,
      maxWaitTimeClinicalTeam: 15,
      appointmentTime: 0
    });
  }

  var attendingOptions = '<option value="None">None</option>';
  this.params.actors.attendings.forEach(function(attending) {
    attendingOptions += '<option value="' + attending.id + '">' + attending.id + '</option>';
  });

  var clinicalTeamOptions = '<option value="None">None</option>';
  this.params.actors.clinicalTeams.forEach(function(clinicalTeam) {
    clinicalTeamOptions += '<option value="' + clinicalTeam.id + '">' + clinicalTeam.id + '</option>';
  });

  var patientsHTML = [
    '<table><thead><tr>',
    '<th></th>',
    '<th>Scheduled time (offset)</th>',
    '<th>Case type</th>',
    '<th>Preferred attending</th>',
    '<th>Max wait for attending</th>',
    '<th>Preferred clinical team</th>',
    '<th>Max wait for team</th>',
    '</tr></thead>'
  ];
  this.params.actors.patients.forEach(function(actor) {
    patientsHTML.push(
      '<tr data-type="Patient">',
      '<td><span class="id">', actor.id, '</span></td>',
      '<td class="narrow"><input type="text" name="appointmentTime" value="', actor.appointmentTime, '"></td>',
      '<td><select name="caseType">',
        '<option value="uc">uc</option>',
        '<option value="btc_new">btc_new</option>',
        '<option value="btc_fu">btc_fu</option>',
      '</select></td>',
      '<td><select name="preferredAttending">', attendingOptions, '</select></td>',
      '<td class="narrow"><input type="text" name="maxWaitTimeAttending" value="', actor.maxWaitTimeAttending, '"></td>',
      '<td><select name="preferredClinicalTeam">', clinicalTeamOptions, '</select></td>',
      '<td class="narrow"><input type="text" name="maxWaitTimeClinicalTeam" value="', actor.maxWaitTimeClinicalTeam, '"></td>',
      '</tr>'
    );
  });
  patientsHTML.push('</table>');

  document.getElementById('patients').innerHTML = patientsHTML.join('');

  var distributionsHTML = [
    '<table><thead><tr>',
    '<th>Distribution</th>',
    '<th>Mean</th>',
    '<th>Min</th>',
    '<th>Max</th>',
    '<th>Stdev</th>',
    '</tr></thead>'
  ];
  Object.keys(this.params.distributions).forEach(function(key) {
    var dist = self.params.distributions[key];
    distributionsHTML.push(
      '<tr data-type="Distribution" data-id="' + key + '">',
      '<td><span class="id">' + dist.name + '</span></td>',
      '<td class="narrow"><input type="text" name="' + key + '_mean" value="' + dist.mean + '"></td>',
      '<td class="narrow"><input type="text" name="' + key + '_min" value="' + dist.min + '"></td>',
      '<td class="narrow"><input type="text" name="' + key + '_max" value="' + dist.max + '"></td>',
      '<td class="narrow"><input type="text" name="' + key + '_stdev" value="' + dist.stdev + '"></td>',
      '</tr>'
    );
  });
  distributionsHTML.push('</table>');

  document.getElementById('distributions').innerHTML = distributionsHTML.join('');

};

Application.prototype.getParams = function() {

  var getValue = function(parent, name) {
    var e = parent.querySelector("[name='" + name + "']");
    return (e.nodeName == 'SELECT') ? e.options[e.selectedIndex].value : e.value;
  };

  var params = this.params;

  params.targetTime = parseFloat(this.txtTargetTime.value);
  params.hurryThreshold = parseFloat(this.txtHurryThreshold.value);
  params.hurryFactor = parseFloat(this.txtHurryFactor.value);

  var patientFields = ['caseType', 'preferredAttending', 'preferredClinicalTeam'];
  var numericFields = ['appointmentTime', 'maxWaitTimeAttending', 'maxWaitTimeClinicalTeam'];
  var patientRows = document.querySelectorAll("[data-type='Patient']");
  patientRows.forEach(function(row, i) {
    patientFields.forEach(function(name) {
      params.actors.patients[i][name] = getValue(row, name);
    });
    numericFields.forEach(function(name) {
      params.actors.patients[i][name] = parseFloat(getValue(row, name));
    });
  });

  var distFields = ['mean', 'min', 'max', 'stdev'];
  var distRows = document.querySelectorAll("[data-type='Distribution']");
  distRows.forEach(function(row, i) {
    var id = row.dataset.id;
    distFields.forEach(function(property) {
      params.distributions[id][property] = parseFloat(getValue(row, id + '_' + property));
    });
  });

  return params;
};


Application.prototype.setParams = function(newParams) {

  this.txtNumAttendings.value = newParams.numAttendings;
  this.txtNumClinicalTeams.value = newParams.numClinicalTeams;
  this.txtNumPatients.value = newParams.numPatients;

  this.txtTargetTime.value = newParams.targetTime;
  this.txtHurryThreshold.value = newParams.hurryThreshold;
  this.txtHurryFactor.value = newParams.hurryFactor;

  console.log(newParams, this.txtHurryFactor);

  this.createSession();

  this.params = newParams;

  var setValue = function(parent, name, value) {
    var e = parent.querySelector("[name='" + name + "']");
    if (e.nodeName == 'SELECT') {
      var option = document.createElement('option');
      option.value = value;
      option.text = value;
      e.add(option, e[0]);
      e.selectedIndex = 0;
    } else {
      e.value = value;
    }
  };

  var patientFields = ['caseType', 'preferredAttending', 'preferredClinicalTeam'];
  var numericFields = ['appointmentTime', 'maxWaitTimeAttending', 'maxWaitTimeClinicalTeam'];
  var patientRows = document.querySelectorAll("[data-type='Patient']");
  patientRows.forEach(function(row, i) {
    patientFields.forEach(function(name) {
      setValue(row, name, newParams.actors.patients[i][name]);
    });
    numericFields.forEach(function(name) {
      setValue(row, name, parseFloat(newParams.actors.patients[i][name]));
    });
  });

  var distFields = ['mean', 'min', 'max', 'stdev'];
  var distRows = document.querySelectorAll("[data-type='Distribution']");
  distRows.forEach(function(row, i) {
    var id = row.dataset.id;
    distFields.forEach(function(name) {
      setValue(row, id + '_' + name, parseFloat(newParams.distributions[id][name]));
    });
  });

};