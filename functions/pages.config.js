module.exports = {
    async rewrites() {
      return [
        {
          source: "/api/addUser",
          destination: "/functions/api/addUser.js",
        },
      ];
    },
  };