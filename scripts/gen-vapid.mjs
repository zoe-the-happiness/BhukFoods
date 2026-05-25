#!/usr/bin/env node
// Generates a VAPID keypair for Web Push and prints the two env vars to paste.
import webpush from "web-push";
const { publicKey, privateKey } = webpush.generateVAPIDKeys();
console.log("VAPID_PUBLIC_KEY=" + publicKey);
console.log("VAPID_PRIVATE_KEY=" + privateKey);
