/**
 * =====================================================================
 * ResolveHub Automated Verification & Testing Suite (Phase 9)
 * Covers: TC01 to TC10 + Security, Scoping, and State Invariant Tests
 * =====================================================================
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

let testResults = [];
let passCount = 0;
let failCount = 0;

function report(testId, name, passed, details = '') {
  testResults.push({ testId, name, passed, details });
  if (passed) {
    passCount++;
    console.log(`  ✓ [${testId}] ${name}`);
  } else {
    failCount++;
    console.log(`  ✗ [${testId}] ${name} — FAILED: ${details}`);
  }
}

async function login(identifier, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername: identifier, password }),
  });
  const data = await res.json();
  const cookie = res.headers.get('set-cookie');
  return { status: res.status, data, cookie };
}

async function runTestSuite() {
  console.log('\n=================================================================');
  console.log('  ResolveHub Test Suite — Phase 9 Formal Assessment Tests');
  console.log('=================================================================\n');

  let admin, agent1, agent2, customer1, customer2;
  let testComplaintId;
  let testCategoryId;

  // --- PREPARATION: Login Base Accounts ---
  console.log('--- Setup: Authenticating Base Test Roles ---');
  admin = await login('admin@resolvehub.com', 'admin123');
  agent1 = await login('amit@resolvehub.com', 'agent123');
  agent2 = await login('priya@resolvehub.com', 'agent123');
  customer1 = await login('rahul@example.com', 'customer123');
  customer2 = await login('sneha@example.com', 'customer123');

  // Fetch Category ID
  const catRes = await fetch(`${BASE_URL}/api/categories`, { headers: { cookie: customer1.cookie } });
  const catData = await catRes.json();
  testCategoryId = catData.categories?.[0]?._id;
  console.log(`  Base users authenticated. Category ID: ${testCategoryId}\n`);

  console.log('--- Formal Test Cases (TC01 to TC10) ---');

  // TC01: Register user
  try {
    const uniqueEmail = `test_user_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Automated Tester ${Date.now()}`,
        username: `user_${Date.now()}`,
        email: uniqueEmail,
        password: 'securePassword123',
      }),
    });
    const regData = await regRes.json();
    const passed = regRes.status === 201 && regData.user?.email === uniqueEmail;
    report('TC01', 'Register User', passed, regData.message);
  } catch (err) {
    report('TC01', 'Register User', false, err.message);
  }

  // TC02: Invalid login
  try {
    const badLogin = await login('rahul@example.com', 'completelyWrongPassword');
    const passed = badLogin.status === 400 && badLogin.data.message?.toLowerCase().includes('invalid');
    report('TC02', 'Invalid Login', passed, `Status ${badLogin.status}: ${badLogin.data.message}`);
  } catch (err) {
    report('TC02', 'Invalid Login', false, err.message);
  }

  // TC03: Create complaint
  try {
    const createRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: customer1.cookie },
      body: JSON.stringify({
        title: 'TC03 Formal Test Complaint',
        description: 'Customer testing complaint submission with complete audit validation.',
        categoryId: testCategoryId,
        priority: 'MEDIUM',
      }),
    });
    const createData = await createRes.json();
    testComplaintId = createData.complaint?._id;
    const passed = createRes.status === 201 && createData.complaint?.status === 'OPEN' && !!createData.complaint?.complaintId;
    report('TC03', 'Create Complaint', passed, `Complaint ID: ${createData.complaint?.complaintId}`);
  } catch (err) {
    report('TC03', 'Create Complaint', false, err.message);
  }

  // TC04: Admin assigns agent
  try {
    // amit's user ID
    const meRes = await fetch(`${BASE_URL}/api/auth/get-me`, { headers: { cookie: agent1.cookie } });
    const meData = await meRes.json();
    const agentAmitId = meData.user?._id || meData.user?.id;

    const assignRes = await fetch(`${BASE_URL}/api/complaints/${testComplaintId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: admin.cookie },
      body: JSON.stringify({ agentId: agentAmitId }),
    });
    const assignData = await assignRes.json();
    const passed = assignRes.status === 200 && assignData.complaint?.status === 'ASSIGNED';
    report('TC04', 'Admin Assigns Agent', passed, `New status: ${assignData.complaint?.status}`);
  } catch (err) {
    report('TC04', 'Admin Assigns Agent', false, err.message);
  }

  // TC05: Agent tries to resolve without resolution
  try {
    const noResRes = await fetch(`${BASE_URL}/api/complaints/${testComplaintId}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: agent1.cookie },
      body: JSON.stringify({ resolution: '   ' }),
    });
    const noResData = await noResRes.json();
    const passed = noResRes.status === 400;
    report('TC05', 'Agent Tries to Resolve Without Resolution', passed, noResData.message);
  } catch (err) {
    report('TC05', 'Agent Tries to Resolve Without Resolution', false, err.message);
  }

  // TC06: Agent resolves complaint
  try {
    // First agent starts investigation
    await fetch(`${BASE_URL}/api/complaints/${testComplaintId}/start`, {
      method: 'PATCH',
      headers: { cookie: agent1.cookie },
    });

    const resolveRes = await fetch(`${BASE_URL}/api/complaints/${testComplaintId}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: agent1.cookie },
      body: JSON.stringify({ resolution: 'Replaced hardware sensor with updated revised component.' }),
    });
    const resolveData = await resolveRes.json();
    const passed = resolveRes.status === 200 && resolveData.complaint?.status === 'RESOLVED';
    report('TC06', 'Agent Resolves Complaint', passed, `Status: ${resolveData.complaint?.status}`);
  } catch (err) {
    report('TC06', 'Agent Resolves Complaint', false, err.message);
  }

  // TC07: Customer closes complaint
  try {
    const closeRes = await fetch(`${BASE_URL}/api/complaints/${testComplaintId}/close`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: customer1.cookie },
      body: JSON.stringify({ note: 'Verified by customer, closing ticket.' }),
    });
    const closeData = await closeRes.json();
    const passed = closeRes.status === 200 && closeData.complaint?.status === 'CLOSED';
    report('TC07', 'Customer Closes Complaint', passed, `Status: ${closeData.complaint?.status}`);
  } catch (err) {
    report('TC07', 'Customer Closes Complaint', false, err.message);
  }

  // TC08: Customer reopens complaint
  try {
    // Create a temporary resolved complaint to test reopen
    const comp2 = await fetch(`${BASE_URL}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: customer1.cookie },
      body: JSON.stringify({
        title: 'TC08 Reopen Test Ticket',
        description: 'Testing customer reopen flow on unresolved intermittent glitch.',
        categoryId: testCategoryId,
      }),
    }).then(r => r.json());

    const c2Id = comp2.complaint?._id;
    // Admin assign + Agent start + resolve
    const meRes = await fetch(`${BASE_URL}/api/auth/get-me`, { headers: { cookie: agent1.cookie } }).then(r => r.json());
    await fetch(`${BASE_URL}/api/complaints/${c2Id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: admin.cookie },
      body: JSON.stringify({ agentId: meRes.user?._id || meRes.user?.id }),
    });
    await fetch(`${BASE_URL}/api/complaints/${c2Id}/start`, { method: 'PATCH', headers: { cookie: agent1.cookie } });
    await fetch(`${BASE_URL}/api/complaints/${c2Id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: agent1.cookie },
      body: JSON.stringify({ resolution: 'First pass diagnostics completed.' }),
    });

    // Customer reopens
    const reopenRes = await fetch(`${BASE_URL}/api/complaints/${c2Id}/reopen`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: customer1.cookie },
      body: JSON.stringify({ reason: 'Issue reoccurred after 24 hours of operation.' }),
    });
    const reopenData = await reopenRes.json();
    const passed = reopenRes.status === 200 && reopenData.complaint?.status === 'REOPENED';
    report('TC08', 'Customer Reopens Complaint', passed, `Status: ${reopenData.complaint?.status}`);
  } catch (err) {
    report('TC08', 'Customer Reopens Complaint', false, err.message);
  }

  // TC09: Customer tries admin API
  try {
    const adminApiRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { cookie: customer1.cookie },
    });
    const passed = adminApiRes.status === 403;
    report('TC09', 'Customer Tries Admin API (RBAC 403 Enforcement)', passed, `Status: ${adminApiRes.status}`);
  } catch (err) {
    report('TC09', 'Customer Tries Admin API', false, err.message);
  }

  // TC10: Invalid complaint ID
  try {
    const badIdRes = await fetch(`${BASE_URL}/api/complaints/000000000000000000000000`, {
      headers: { cookie: customer1.cookie },
    });
    const passed = badIdRes.status === 404;
    report('TC10', 'Invalid Complaint ID (404 Handling)', passed, `Status: ${badIdRes.status}`);
  } catch (err) {
    report('TC10', 'Invalid Complaint ID', false, err.message);
  }

  console.log('\n--- Additional Invariant, Security & Robustness Tests ---');

  // TC11: Unauthorized Access
  try {
    const unauth = await fetch(`${BASE_URL}/api/complaints`);
    const passed = unauth.status === 401;
    report('TC11', 'Unauthorized Access Blocked (401)', passed, `Status: ${unauth.status}`);
  } catch (err) {
    report('TC11', 'Unauthorized Access Blocked', false, err.message);
  }

  // TC12: Cross-Customer Isolation
  try {
    const cust2OnCust1 = await fetch(`${BASE_URL}/api/complaints/${testComplaintId}`, {
      headers: { cookie: customer2.cookie },
    });
    const passed = cust2OnCust1.status === 403;
    report('TC12', 'Cross-Customer Scoping Isolation (403)', passed, `Status: ${cust2OnCust1.status}`);
  } catch (err) {
    report('TC12', 'Cross-Customer Scoping Isolation', false, err.message);
  }

  // TC13: Unassigned Agent Access Blocked
  try {
    const unassignedAgent = await fetch(`${BASE_URL}/api/complaints/${testComplaintId}`, {
      headers: { cookie: agent2.cookie },
    });
    const passed = unassignedAgent.status === 403;
    report('TC13', 'Non-Assigned Agent Scoping Isolation (403)', passed, `Status: ${unassignedAgent.status}`);
  } catch (err) {
    report('TC13', 'Non-Assigned Agent Scoping Isolation', false, err.message);
  }

  // TC14: Invalid Status Transition (Cannot close OPEN complaint)
  try {
    const freshOpen = await fetch(`${BASE_URL}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: customer1.cookie },
      body: JSON.stringify({
        title: 'TC14 Transition Test',
        description: 'Testing illegal direct closure on freshly opened ticket.',
        categoryId: testCategoryId,
      }),
    }).then(r => r.json());

    const freshId = freshOpen.complaint?._id;
    const directCloseRes = await fetch(`${BASE_URL}/api/complaints/${freshId}/close`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: customer1.cookie },
      body: JSON.stringify({ note: 'Direct close attempt' }),
    });
    const passed = directCloseRes.status === 400;
    report('TC14', 'Invalid Status Transition Blocked (OPEN -> CLOSED rejected)', passed, `Status: ${directCloseRes.status}`);
  } catch (err) {
    report('TC14', 'Invalid Status Transition Blocked', false, err.message);
  }

  // TC15: Closed Complaint Editing Prevention
  try {
    const editClosedRes = await fetch(`${BASE_URL}/api/complaints/${testComplaintId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: agent1.cookie },
      body: JSON.stringify({ note: 'Attempting note on closed ticket' }),
    });
    const passed = editClosedRes.status === 400;
    report('TC15', 'Closed Complaint Modification Protection', passed, `Status: ${editClosedRes.status}`);
  } catch (err) {
    report('TC15', 'Closed Complaint Modification Protection', false, err.message);
  }

  console.log('\n=================================================================');
  console.log(`  Test Summary: ${passCount} PASSED, ${failCount} FAILED (Total: ${testResults.length})`);
  console.log('=================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTestSuite();
