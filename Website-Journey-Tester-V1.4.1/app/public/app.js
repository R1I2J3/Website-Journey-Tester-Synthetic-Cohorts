let latestSingleReport = null;
let latestCohortReport = null;

const el = id => document.getElementById(id);

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

function setMode(mode) {
  const single = mode === 'single';
  el('singlePanel').classList.toggle('hidden', !single);
  el('cohortPanel').classList.toggle('hidden', single);
  el('singleModeButton').classList.toggle('active', single);
  el('cohortModeButton').classList.toggle('active', !single);
}

el('singleModeButton').addEventListener('click', () => setMode('single'));
el('cohortModeButton').addEventListener('click', () => setMode('cohort'));

el('scanButton').addEventListener('click', async () => {
  const button = el('scanButton');
  button.disabled = true;
  el('scanResult').textContent = 'Scanning website...';
  try {
    const scan = await api('/api/scan');
    if (!scan.totals.pages) {
      el('scanResult').innerHTML = '<p class="warning">No HTML pages found. Copy website files into the website folder and scan again.</p>';
      return;
    }
    const pages = scan.pages.slice(0, 8).map(p => `<li>${esc(p.path)} — ${esc(p.title)}</li>`).join('');
    el('scanResult').innerHTML = `<strong>Website found</strong><ul>${scan.summaryLines.map(line => `<li>${esc(line)}</li>`).join('')}</ul><strong>Main pages</strong><ul>${pages}</ul>`;
  } catch (error) {
    el('scanResult').innerHTML = `<p class="warning">${esc(error.message)}</p>`;
  } finally {
    button.disabled = false;
  }
});

el('assessButton').addEventListener('click', async () => {
  const persona = el('persona').value.trim();
  const task = el('task').value.trim();
  const model = el('singleModel').value;
  if (!persona || !task) {
    el('singleReport').innerHTML = '<p class="warning">Enter both a persona and a task.</p>';
    return;
  }

  el('assessButton').disabled = true;
  el('modifyButton').disabled = true;
  el('singleReport').innerHTML = '<div class="loading-panel"><strong>Running local AI assessment…</strong><p>The first run can take longer while Ollama loads the model into memory.</p></div>';

  try {
    latestSingleReport = await api('/api/assess', {
      method: 'POST',
      body: JSON.stringify({ persona, task, model })
    });
    const r = latestSingleReport;
    const friction = (r.friction || []).map(x => `<li>${esc(x)}</li>`).join('');
    const suggestions = (r.suggestions || []).map(x => `<label class="suggestion"><input type="checkbox" value="${esc(x.id)}" checked><span><strong>${esc(x.title)}</strong>${esc(x.action)}<small>Target page: ${esc(x.targetPage)}</small></span></label>`).join('');
    el('singleReport').innerHTML = `<span class="outcome">${esc(r.outcome)}</span><p>${esc(r.plainSummary)}</p><p><strong>Assessment source:</strong> ${esc(r.source)}</p><h3>Friction</h3><ul>${friction}</ul><h3>Suggested improvements</h3>${suggestions}`;
    el('modifyButton').disabled = false;
  } catch (error) {
    el('singleReport').innerHTML = `<p class="warning">${esc(error.message)}</p>`;
  } finally {
    el('assessButton').disabled = false;
  }
});

el('modifyButton').addEventListener('click', async () => {
  const selectedIds = [...el('singleReport').querySelectorAll("input[type='checkbox']:checked")].map(input => input.value);
  el('modifyButton').disabled = true;
  el('modifyResult').textContent = 'Applying selected improvements with the local AI. This may take a few minutes...';
  try {
    const result = await api('/api/modify', {
      method: 'POST',
      body: JSON.stringify({ selectedIds })
    });
    const changes = result.changes || [];
    el('modifyResult').innerHTML = `<strong>Modified copy created: ${esc(result.modifiedFolderName)}</strong><ul>${changes.map(x => `<li><strong>${esc(x.file)}</strong> — ${esc(x.change)}<br><small>${x.method === 'ai_edit' ? 'Applied as a validated HTML edit.' : x.method === 'review_fallback' ? 'Not auto-applied; a review note was added instead.' : 'Skipped.'}${x.note ? ` ${esc(x.note)}` : ''}</small></li>`).join('')}</ul><p><a href="${esc(result.modifiedPreviewUrl)}" target="_blank">Open modified copy</a></p><p class="muted-text">V1.4.1 applies only changes that pass source-level safety checks. Improvements that require unknown facts or backend functionality stay as clearly labelled owner-review notes instead of being invented.</p>`;
  } catch (error) {
    el('modifyResult').innerHTML = `<p class="warning">${esc(error.message)}</p>`;
  } finally {
    el('modifyButton').disabled = false;
  }
});

function traitSettings() {
  return {
    digitalConfidence: el('digitalConfidence').value,
    formConfidence: el('formConfidence').value,
    organisationFamiliarity: el('organisationFamiliarity').value,
    timePressure: el('timePressure').value,
    reassuranceNeed: el('reassuranceNeed').value,
    supportSeeking: el('supportSeeking').value,
    accessibilityNeed: el('accessibilityNeed').value
  };
}

function profileCard(profile) {
  return `<details><summary>Synthetic user ${profile.id}: age ${profile.age}</summary><div class="profile-grid"><span>Digital confidence: <strong>${esc(profile.digitalConfidence)}</strong></span><span>Form confidence: <strong>${esc(profile.formConfidence)}</strong></span><span>Organisation familiarity: <strong>${esc(profile.organisationFamiliarity)}</strong></span><span>Time pressure: <strong>${esc(profile.timePressure)}</strong></span><span>Need for reassurance: <strong>${esc(profile.reassuranceNeed)}</strong></span><span>Support seeking: <strong>${esc(profile.supportSeeking)}</strong></span><span>Accessibility: <strong>${esc(profile.accessibilityNeed)}</strong></span></div></details>`;
}

function outcomeCard(label, item, className) {
  return `<div class="metric-card ${className}"><span class="metric-number">${esc(item.percentage)}%</span><strong>${esc(label)}</strong><small>${esc(item.count)} of ${esc(item.count + 0)}</small></div>`;
}

el('runCohortButton').addEventListener('click', async () => {
  const button = el('runCohortButton');
  const cohortKey = el('cohort').value;
  const model = el('cohortModel').value;
  const count = Number(el('simulationCount').value);
  const seed = Number(el('seed').value);
  const task = el('cohortTask').value.trim();

  if (!task) {
    el('cohortProgress').innerHTML = '<p class="warning">Enter a task first.</p>';
    return;
  }

  button.disabled = true;
  el('cohortModifyButton').disabled = true;
  el('cohortResult').innerHTML = '<p class="muted-text">Waiting for simulations to finish…</p>';

  try {
    const created = await api('/api/cohort/create', {
      method: 'POST',
      body: JSON.stringify({ cohortKey, count, seed, traits: traitSettings() })
    });

    el('cohortProgress').innerHTML = `<strong>Generated ${created.profiles.length} synthetic users.</strong><div class="profiles">${created.profiles.map(profileCard).join('')}</div><div id="liveProgress" class="live-progress"></div>`;
    el('liveProgress').innerHTML = '<strong>Preparing task evidence baseline…</strong><p>The model analyses the task against the scanned website once before profile simulations begin.</p>';

    const baseline = await api('/api/cohort/prepare', {
      method: 'POST',
      body: JSON.stringify({ task, model })
    });

    const baselineEvidence = (baseline.evidence || []).map(x => `<li><strong>${esc(x.page)}</strong>: ${esc(x.finding)}</li>`).join('');
    el('liveProgress').innerHTML = `<div class="notice"><strong>Task baseline: ${esc(baseline.taskStatus)}</strong><br>${esc(baseline.reason)}<ul>${baselineEvidence || '<li>No saved evidence lines.</li>'}</ul><small>Visible support/contact route in scanned source: ${baseline.supportRouteVisible ? 'Yes' : 'No'}</small></div><p>Starting profile simulations…</p>`;

    const results = [];
    const durations = [];
    for (let i = 0; i < created.profiles.length; i += 1) {
      const averageMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
      const remaining = created.profiles.length - i;
      const etaText = averageMs ? ` Approximate remaining time: ${Math.max(1, Math.round((averageMs * remaining) / 1000))} seconds.` : ' First profile simulation may take longer while the model settles.';
      el('liveProgress').innerHTML += `<div id="currentRun"><strong>Simulation ${i + 1} of ${created.profiles.length}</strong><div class="progress-shell"><div class="progress-fill" style="width:${Math.round((i / created.profiles.length) * 100)}%"></div></div><p>${esc(etaText)}</p></div>`;

      const result = await api('/api/cohort/simulate', {
        method: 'POST',
        body: JSON.stringify({ profile: created.profiles[i], task, model, baseline })
      });
      results.push(result);
      durations.push(result.durationMs || 0);
      const current = document.getElementById('currentRun');
      if (current) current.remove();
    }

    el('liveProgress').innerHTML += `<strong>All ${created.profiles.length} profile simulations completed.</strong><div class="progress-shell"><div class="progress-fill" style="width:100%"></div></div><p>Creating aggregate statistics and priority recommendations…</p>`;

    const finalReport = await api('/api/cohort/finalize', {
      method: 'POST',
      body: JSON.stringify({
        cohort: created.cohort,
        cohortKey,
        seed: created.seed,
        profiles: created.profiles,
        task,
        model,
        baseline,
        results
      })
    });

    latestCohortReport = finalReport;
    renderCohortReport(finalReport);
    el('liveProgress').innerHTML += `<p><strong>Finished.</strong> One task baseline + ${created.profiles.length} profile simulations + aggregate report completed.</p>`;
  } catch (error) {
    el('cohortProgress').innerHTML += `<p class="warning">${esc(error.message)}</p>`;
  } finally {
    button.disabled = false;
  }
});

function renderCohortReport(report) {
  const a = report.aggregate;
  const baseline = report.baseline || {};
  const friction = (a.friction || []).map(x => `<li><strong>${esc(x.code.replace(/_/g, ' '))}</strong> — ${esc(x.count)}/${esc(a.total)} synthetic assessments (${esc(x.percentage)}%)</li>`).join('');
  const recommendations = (report.recommendations || []).map(x => `
    <label class="suggestion">
      <input type="checkbox" value="${esc(x.id)}" checked>
      <span>
        <strong>${esc(x.title)}</strong>
        ${esc(x.reason)}
        <br><span>${esc(x.action)}</span>
        <small>Target page: ${esc(x.targetPage)}</small>
      </span>
    </label>
  `).join('');
  const baselineEvidence = (baseline.evidence || []).map(x => `<li><strong>${esc(x.page)}</strong>: ${esc(x.finding)}</li>`).join('');
  const rows = (report.results || []).map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x.profile.age)}</td><td>${esc(x.profile.digitalConfidence)}</td><td>${esc(x.profile.formConfidence)}</td><td>${esc(x.profile.supportSeeking || '')}</td><td>${esc(x.profile.accessibilityNeed)}</td><td>${esc(x.evidenceAssessment?.impactLevel || '')}</td><td><strong>${esc(x.outcome.replace('_', ' '))}</strong></td><td>${esc(x.reason)}</td><td>${esc(x.evidenceAssessment?.classificationRule || '')}</td><td>${Math.round((x.durationMs || 0) / 1000)}s</td></tr>`).join('');

  el('cohortResult').innerHTML = `
    <h3>${esc(report.cohort)} — Synthetic Cohort Result</h3>
    <p><strong>Model:</strong> ${esc(report.model)} &nbsp; <strong>Simulations:</strong> ${esc(a.total)} &nbsp; <strong>Seed:</strong> ${esc(report.seed)}</p>
    <div class="notice"><strong>Task evidence baseline: ${esc(baseline.taskStatus || 'unknown')}</strong><p>${esc(baseline.reason || '')}</p><ul>${baselineEvidence || '<li>No baseline evidence saved.</li>'}</ul><small>Visible support/contact route in scanned source: ${baseline.supportRouteVisible ? 'Yes' : 'No'}</small></div>
    <div class="metrics">
      <div class="metric-card"><span class="metric-number">${a.outcomes.complete.percentage}%</span><strong>Predicted complete</strong><small>${a.outcomes.complete.count}/${a.total}</small></div>
      <div class="metric-card"><span class="metric-number">${a.outcomes.needs_support.percentage}%</span><strong>Predicted need support</strong><small>${a.outcomes.needs_support.count}/${a.total}</small></div>
      <div class="metric-card"><span class="metric-number">${a.outcomes.abandon.percentage}%</span><strong>Predicted abandon</strong><small>${a.outcomes.abandon.count}/${a.total}</small></div>
    </div>
    <h3>Most frequent friction</h3>
    <ol>${friction || '<li>No recurring friction identified.</li>'}</ol>
    <h3>Priority improvements</h3>
    ${recommendations || '<p class="warning">No priority improvements were generated.</p>'}
    <h3>Individual synthetic assessments</h3>
    <div class="table-wrap"><table><thead><tr><th>#</th><th>Age</th><th>Digital</th><th>Forms</th><th>Support seeking</th><th>Accessibility</th><th>Impact</th><th>Outcome</th><th>Reason</th><th>Rule</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p><strong>Average individual simulation:</strong> ${Math.round(a.averageDurationMs / 1000)} seconds.</p>
    ${a.fallbackCount ? `<p class="warning">${a.fallbackCount} profile assessment(s) used a neutral parser fallback. Review before relying on the distribution.</p>` : ''}
    <p><a href="/reports/latest-cohort-report.html" target="_blank">Open saved cohort report</a></p>
    <div class="notice"><strong>Important:</strong> ${esc(report.disclaimer)}</div>
  `;

  el('cohortModifyButton').disabled = !(report.recommendations || []).length;
  el('cohortModifyResult').textContent = 'No cohort modified copy created yet.';
}

el('cohortModifyButton').addEventListener('click', async () => {
  if (!latestCohortReport) {
    el('cohortModifyResult').innerHTML = '<p class="warning">Run the Synthetic Cohort first.</p>';
    return;
  }

  const selectedIds = [...el('cohortResult').querySelectorAll("input[type='checkbox']:checked")].map(input => input.value);
  el('cohortModifyButton').disabled = true;
  el('cohortModifyResult').textContent = 'Applying selected cohort improvements with the local AI. This may take a few minutes...';

  try {
    const result = await api('/api/cohort/modify', {
      method: 'POST',
      body: JSON.stringify({ selectedIds })
    });
    const changes = result.changes || [];
    el('cohortModifyResult').innerHTML = `<strong>Modified copy created: ${esc(result.modifiedFolderName)}</strong><ul>${changes.map(x => `<li><strong>${esc(x.file)}</strong> — ${esc(x.change)}<br><small>${x.method === 'ai_edit' ? 'Applied as a validated HTML edit.' : x.method === 'review_fallback' ? 'Not auto-applied; a review note was added instead.' : 'Skipped.'}${x.note ? ` ${esc(x.note)}` : ''}</small></li>`).join('')}</ul><p><a href="${esc(result.modifiedPreviewUrl)}" target="_blank">Open modified copy</a></p><p class="muted-text">V1.4.1 attempts real HTML edits for approved recommendations. If a change requires unknown facts, a real backend endpoint, or fails validation, it safely falls back to an owner-review note instead of altering the page blindly.</p>`;
  } catch (error) {
    el('cohortModifyResult').innerHTML = `<p class="warning">${esc(error.message)}</p>`;
  } finally {
    el('cohortModifyButton').disabled = false;
  }
});

