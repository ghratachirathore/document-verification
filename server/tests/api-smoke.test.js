import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../src/app.js";
import { env } from "../src/config/env.js";
import { authService } from "../src/services/auth.service.js";

const uniqueEmail = () => `candidate.${Date.now()}.${Math.random().toString(36).slice(2)}@eduverify.ai`;

test("auth endpoints support register, login, me, logout and reject malformed tokens", async () => {
  const email = uniqueEmail();

  const registerResponse = await request(app)
    .post("/api/v1/auth/register")
    .send({ name: "Smoke Candidate", email, password: "EduVfy-Candidate-2026!p9Q4zL2", role: "candidate" })
    .expect(201);

  assert.equal(registerResponse.body.success, true);
  assert.equal(registerResponse.body.data.user.email, email);
  assert.ok(registerResponse.body.data.token);

  const loginResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: "EduVfy-Candidate-2026!p9Q4zL2" })
    .expect(200);

  const token = loginResponse.body.data.token;
  assert.ok(token);

  const meResponse = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(meResponse.body.data.user.email, email);

  await request(app).get("/api/v1/auth/me").set("Authorization", `Token ${token}`).expect(401);

  const expiredToken = jwt.sign({ id: registerResponse.body.data.user._id, email, role: "candidate" }, env.jwtSecret, { expiresIn: "-1s" });
  const expiredResponse = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${expiredToken}`).expect(401);
  assert.equal(expiredResponse.body.message, "Access token expired");

  const logoutResponse = await request(app).post("/api/v1/auth/logout").set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(logoutResponse.body.data.loggedOut, true);
});

test("candidate document workflow endpoints process upload, list documents, and return report", async () => {
  const loginResponse = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "candidate@eduverify.ai", password: "EduVfy-Candidate-2026!p9Q4zL2" })
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
    .send({ email: "hr@eduverify.ai", password: "EduVfy-Recruiter-2026!R7mK8sT3" })
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

  const degreeFilter = await request(app)
    .get("/api/v1/hr/candidates")
    .query({ degree: "Bachelor", riskLevel: "review" })
    .set("Authorization", `Bearer ${token}`)
    .expect(200);
  assert.ok(degreeFilter.body.data.candidates.every((candidate) => candidate.candidateProfile.degree.includes("Bachelor")));
  assert.ok(degreeFilter.body.data.candidates.every((candidate) => candidate.candidateProfile.verificationStatus === "Needs Review"));

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

  const hrLogin = await request(app).post("/api/v1/auth/login").send({ email: "hr@eduverify.ai", password: "EduVfy-Recruiter-2026!R7mK8sT3" }).expect(200);
  const hrToken = hrLogin.body.data.token;

  await request(app).get("/api/v1/hr/candidates").query({ minCgpa: "abc" }).set("Authorization", `Bearer ${hrToken}`).expect(400);
  await request(app).get("/api/v1/hr/candidates").query({ riskLevel: "severe" }).set("Authorization", `Bearer ${hrToken}`).expect(400);

  const candidates = await request(app).get("/api/v1/hr/candidates").set("Authorization", `Bearer ${hrToken}`).expect(200);
  const candidateId = candidates.body.data.candidates[0]._id;

  await request(app)
    .patch(`/api/v1/hr/candidates/${candidateId}/action`)
    .set("Authorization", `Bearer ${hrToken}`)
    .send({ action: "archive" })
    .expect(400);

  const candidateLogin = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "candidate@eduverify.ai", password: "EduVfy-Candidate-2026!p9Q4zL2" })
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

test("deployment auth settings support CORS preflight and production cookies", async () => {
  const preflight = await request(app)
    .options("/api/v1/auth/login")
    .set("Origin", "http://localhost:5173")
    .set("Access-Control-Request-Method", "POST")
    .expect(204);

  assert.equal(preflight.headers["access-control-allow-origin"], "http://localhost:5173");
  assert.equal(preflight.headers["access-control-allow-credentials"], "true");

  const rejectedPreflight = await request(app)
    .options("/api/v1/auth/login")
    .set("Origin", "https://untrusted.example.com")
    .set("Access-Control-Request-Method", "POST");

  assert.ok([200, 204].includes(rejectedPreflight.status));
  assert.equal(rejectedPreflight.headers["access-control-allow-origin"], undefined);

  const previousNodeEnv = env.nodeEnv;
  env.nodeEnv = "production";
  const options = authService.cookieOptions();
  env.nodeEnv = previousNodeEnv;

  assert.equal(options.sameSite, "none");
  assert.equal(options.secure, true);
});
