<template>
  <Snackbar ref="snackbarRef" />
  <div class="account-page">
    <div class="form-container">
      <div class="user-form">
        <!-- Profile  -->
        <div class="profile-pic-container">
          <div class="profile-pic-wrapper">
            <img :src="profilePic" alt="Profile Picture" class="profile-pic" />
            <label class="change-pic-button">
              📷 Change
              <input
                type="file"
                accept="image/*"
                @change="onFileChange"
                hidden
              />
            </label>
          </div>
        </div>

        <div
          v-if="!userStore.isFirm"
          v-for="(_, user_key) in userFields"
          :key="user_key"
          class="form-field"
        >
          <label :for="user_key">{{ formatLabel(user_key) }}</label>
          <input
            :id="user_key"
            v-model="userFields[user_key]"
            :disabled="user_key === 'email'"
            type="text"
            class="input"
          />
        </div>

        <div
          v-else
          v-for="(_, firm_key) in firmFields"
          :key="firm_key"
          class="form-field"
        >
          <label :for="firm_key">{{ formatLabel(firm_key) }}</label>
          <input
            :id="firm_key"
            v-model="firmFields[firm_key]"
            :disabled="firm_key === 'email'"
            type="text"
            class="input"
          />
        </div>

        <div class="save-changes-button-container">
          <button class="save-changes-button" @click="saveChanges">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from "vue";
import { useUserStore } from "../stores/user";
import defaultProfilePicture from "../assets/default_profile_picture.png";
import { editFirmAccount, editUserDocument } from "../api/firestore";
import { RETURN_TYPES } from "../utils/error-codes";
import Snackbar from "../components/Snackbar.vue";
import { getErrorType } from "../utils/error-codes";
import {
  validateCUI,
  validateName,
  validateTelephone,
} from "../utils/validation-rules";

const snackbarRef = ref<InstanceType<typeof Snackbar> | null>(null);
const userStore = useUserStore();
const user = userStore.userInfo || {
  name: "",
  company_name: "",
  representative_name: "",
  email: "",
  cui: "",
  telephone: "",
  isFirm: false,
  profile_pic: "",
  google_uid: "",
};

const firmFields = reactive({
  company_name: user.company_name || "",
  representative_name: user.representative_name || "",
  email: user.email || "",
  cui: user.cui || "",
  telephone: user.telephone || "",
});

const userFields = reactive({
  name: user.name || "",
  email: user.email || "",
  telephone: user.telephone || "",
});

const profilePicFile = reactive<{ file: File | null }>({ file: null });

const profilePic = computed(() => {
  if (profilePicFile.file) {
    return URL.createObjectURL(profilePicFile.file);
  }
  return user.profile_pic || defaultProfilePicture;
});

const saveChanges = async () => {
  if (!userStore.isFirm) {
    if (!validateUserForm()) {
      return;
    }

    const return_type = await editUserDocument(
      user.google_uid,
      userFields.email,
      userFields.telephone.trim(),
      userFields.name.trim(),
      profilePicFile.file
    );
    if (return_type === RETURN_TYPES.SUCCESS) {
      userStore.editUser({
        ...user,
        name: userFields.name,
        email: userFields.email,
        profile_pic: profilePicFile.file
          ? URL.createObjectURL(profilePicFile.file)
          : user.profile_pic,
      });
      snackbarRef.value?.showSnackbar(
        "Profile updated successfully!",
        "success"
      );
    } else {
      displayError(return_type);
    }
  } else {
    if (!validateFirmForm()) {
      return;
    }

    const return_type = await editFirmAccount(
      user.google_uid,
      firmFields.company_name.trim(),
      firmFields.representative_name.trim(),
      firmFields.cui,
      firmFields.telephone,
      profilePicFile.file
    );
    if (return_type === RETURN_TYPES.SUCCESS) {
      userStore.editUser({
        ...user,
        company_name: firmFields.company_name,
        representative_name: firmFields.representative_name,
        cui: firmFields.cui,
        telephone: firmFields.telephone,
        profile_pic: profilePicFile.file
          ? URL.createObjectURL(profilePicFile.file)
          : user.profile_pic,
      });
      snackbarRef.value?.showSnackbar(
        "Profile updated successfully!",
        "success"
      );
    } else {
      displayError(return_type);
    }
  }
};

const validateUserForm = (): Boolean => {
  if (!userFields.name || !userFields.email || !userFields.telephone) {
    displayError(RETURN_TYPES.CREDENTIALS_REQUIRED);
    return false;
  }

  if (validateName(userFields.name) === false) {
    displayError(RETURN_TYPES.INVALID_USER_NAME_FORMAT);
    return false;
  }

  if (validateTelephone(userFields.telephone) === false) {
    displayError(RETURN_TYPES.INVALID_TELEPHONE_FORMAT);
    return false;
  }

  return true;
};

const validateFirmForm = (): Boolean => {
  if (
    !firmFields.company_name ||
    !firmFields.representative_name ||
    !firmFields.cui ||
    !firmFields.telephone
  ) {
    displayError(RETURN_TYPES.CREDENTIALS_REQUIRED);
    return false;
  }

  // if (validateName(firmFields.company_name) === false) {
  //   displayError(RETURN_TYPES.INVALID_FIRM_NAME_FORMAT);
  //   return false;
  // }

  if (validateName(firmFields.representative_name) === false) {
    displayError(RETURN_TYPES.INVALID_REPRESENTATIVE_NAME_FORMAT);
    return false;
  }

  if (validateTelephone(firmFields.telephone) === false) {
    displayError(RETURN_TYPES.INVALID_TELEPHONE_FORMAT);
    return false;
  }

  if (validateCUI(firmFields.cui) === false) {
    displayError(RETURN_TYPES.INVALID_CUI_FORMAT);
    return false;
  }

  return true;
};
const formatLabel = (key: string) => {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    profilePicFile.file = file;
  }
};
const displayError = (error_type: RETURN_TYPES) => {
  snackbarRef.value?.showSnackbar(getErrorType(error_type), "error");
};
</script>

<style scoped>
.account-page {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 40px;
  flex-wrap: wrap;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
}

.form-container {
  flex: 1;
  display: flex;
  justify-content: center;
  width: 100%;
}

.user-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.profile-pic-container {
  grid-column: span 2;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
}

.input:focus {
  border-color: #00a880;
  outline: none;
}

.save-changes-button-container {
  grid-column: span 2;
  display: flex;
  justify-content: center;
}

.save-changes-button {
  padding: 10px 20px;
  background-color: #00c49a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.save-changes-button:hover {
  background-color: #00a880;
}

.profile-pic-wrapper {
  position: relative;
  display: inline-block;
}

.change-pic-button {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, 100%);
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 10px;
  width: 4rem;
  font-size: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-align: center;
}

.change-pic-button:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.profile-pic {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;
}

/* 🧩 Add this media query for responsiveness */
@media (max-width: 600px) {
  .user-form {
    grid-template-columns: 1fr;
  }

  .profile-pic-container {
    grid-column: span 1;
    justify-content: center;
  }

  .save-changes-button-container {
    grid-column: span 1;
  }
}
</style>
