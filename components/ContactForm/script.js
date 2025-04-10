import ButtonUnderlined from '@/components/ButtonUnderlined'
export default {
    name: "ContactForm",
    components: ButtonUnderlined,
    data() {
      return {
        formData: {
          name: "",
          email: "",
          message: "",
        },
        submissionSuccess: false,
        errorMessage: "",
      };
    },
    methods: {
      async handleSubmit() {
        try {
          // Simulate a submission delay.
          // Replace this with your actual API call if needed.
          await new Promise((resolve) => setTimeout(resolve, 1000));
          this.submissionSuccess = true;
          // Optionally, clear the form fields after submission:
          this.formData.name = "";
          this.formData.email = "";
          this.formData.message = "";
        } catch (error) {
          this.errorMessage = "Something went wrong. Please try again.";
        }
      },
    },
  };
  