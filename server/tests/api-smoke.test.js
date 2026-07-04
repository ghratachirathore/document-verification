import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { app } from "../src/app.js";

const uniqueEmail = () => `candidate.${Date.now()}.${Math.random().toString(36).slice(2)}@eduverify.ai`;

test("auth endpoints support register, login, me, logout and reject malformed tokens", async () => {
  const email = uniqueEmail();

  const registerResponse = await request(app)
    .post("/api/v1/auth/register")
    .send({ name: "Smoke Candidate", email, password: "Candidate@123", role: "candidate" })
    .expect(201);

  assert.equal(registerResponse.body.success, true);
  assert.equal(registerResponse.body.data.user.email, email);
  assert.ok(registerResponse.body.data.token);

  const loginResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: "Candidate@123" })
    .expect(200);

  const token = loginResponse.body.data.token;
  assert.ok(token);

  const meResponse = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(meResponse.body.data.user.email, email);

  await request(app).get("/api/v1/auth/me").set("Authorization", `Token ${token}`).expect(401);

  const logoutResponse = await request(app).post("/api/v1/auth/logout").set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(logoutResponse.body.data.loggedOut, true);
});

test("candidate document workflow endpoints process upload, list documents, and return report", async () => {
  const loginResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "candidate@eduverify.ai", password: "Candidate@123" })
    .expect(200);

  const token = loginResponse.body.data.token;

  const uploadResponse = await request(app)
    .post("/api/v1/documents/upload")
    .set("Authorization", `Bearer ${token}`)
    .field("type", "resume")
    .attach("document", Buffer.from("%PDF-1.4 EduVerify smoke"), {
      filename: "aman-resume.pdf",
      contentType: "application/pdf"
    })
    .expect(201);

  assert.equal(uploadResponse.body.success, true);
  assert.equal(uploadResponse.body.data.document.type, "resume");
  assert.ok(uploadResponse.body.data.verification);
  assert.ok(uploadResponse.body.data.summary);
  assert.ok(uploadResponse.body.data.candidate);

  const listResponse = await request(app).get("/api/v1/documents").set("Authorization", `Bearer ${token}`).expect(200);
  assert.ok(Array.isArray(listResponse.body.data.documents));

  const profileResponse = await request(app).get("/api/v1/candidates/me").set("Authorization", `Bearer ${token}`).expect(200);
  assert.ok(profileResponse.body.data.candidate);
  assert.ok(profileResponse.body.data.verification);

  const reportResponse = await request(app).get("/api/v1/candidates/me/report").set("Authorization", `Bearer ${token}`).expect(200);
  assert.ok(reportResponse.body.data.verification);
});

test("HR endpoints expose analytics, candidate detail, filtering, and decisions", async () => {
  const loginResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "hr@eduverify.ai", password: "HR@123456" })
    .expect(200);

  const token = loginResponse.body.data.token;

  const analyticsResponse = await request(app).get("/api/v1/hr/analytics").set("Authorization", `Bearer ${token}`).expect(200);
  assert.ok(analyticsResponse.body.data.overview.totalCandidates >= 1);

  const listResponse = await request(app)
    .get("/api/v1/hr/candidates")
    .query({ internshipVerified: "false" })
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  assert.ok(Array.isArray(listResponse.body.data.candidates));
  const candidateId = listResponse.body.data.candidates[0]._id;

  const detailResponse = await request(app).get(`/api/v1/hr/candidates/${candidateId}`).set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(detailResponse.body.data.candidate._id, candidateId);

  const actionResponse = await request(app)
    .patch(`/api/v1/hr/candidates/${candidateId}/action`)
    .set("Authorization", `Bearer ${token}`)
    .send({ action: "request_clarification", message: "Please provide internship proof." })
    .expect(200);
  assert.equal(actionResponse.body.data.candidate.candidateProfile.hrDecision, "clarification_requested");

  const clarificationResponse = await request(app)
    .post(`/api/v1/hr/candidates/${candidateId}/clarifications`)
    .set("Authorization", `Bearer ${token}`)
    .send({ message: "Upload supporting academic evidence." })
    .expect(201);
  assert.ok(clarificationResponse.body.data.candidate.candidateProfile.clarifications.length >= 1);
});

test("validation rejects invalid auth, filters, HR actions, and document types", async () => {
  await request(app)
    .post("/api/v1/auth/register")
    .send({ name: "Bad User", email: "not-an-email", password: "short", role: "candidate" })
    .expect(400);

  const hrLogin = await request(app).post("/api/v1/auth/login").send({ email: "hr@eduverify.ai", password: "HR@123456" }).expect(200);
  const hrToken = hrLogin.body.data.token;

  await request(app).get("/api/v1/hr/candidates").query({ minCgpa: "abc" }).set("Authorization", `Bearer ${hrToken}`).expect(400);

  const candidates = await request(app).get("/api/v1/hr/candidates").set("Authorization", `Bearer ${hrToken}`).expect(200);
  const candidateId = candidates.body.data.candidates[0]._id;

  await request(app)
    .patch(`/api/v1/hr/candidates/${candidateId}/action`)
    .set("Authorization", `Bearer ${hrToken}`)
    .send({ action: "archive" })
    .expect(400);

  const candidateLogin = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "candidate@eduverify.ai", password: "Candidate@123" })
    .expect(200);
  const candidateToken = candidateLogin.body.data.token;

  await request(app)
    .post("/api/v1/documents/upload")
    .set("Authorization", `Bearer ${candidateToken}`)
    .field("type", "unknown")
    .attach("document", Buffer.from("%PDF-1.4 EduVerify smoke"), {
      filename: "file.pdf",
      contentType: "application/pdf"
    })
    .expect(400);
});
