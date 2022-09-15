# AudioCodes Voice Verification Extension

This extension is used to trigger actions for the [voice verification process in AudioCodes voice gateway](https://techdocs.audiocodes.com/voice-ai-connect/#VAIG_Combined/speaker-verification.htm) either with Phonexia or with Nuance. 

All nodes only have one field and that is for the required speaker ID. 
----

# Node: Check enrollment status of user

This node checks to see if the user is already enrolled in the voice verification process.

----

# Node: Start the enrollment process for new users

If a user is not yet enrolled this node starts the enrollment process. 

----

# Node: Start the verification process for existing users

If a user is already enrolled this starts the verification process. 

---

# Node: Delete voice verification profile

Deletes voice verification profile of enrolled user. 