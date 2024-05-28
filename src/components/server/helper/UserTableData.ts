type Key = {
  key: string;
  Title: string;
  TemplateName: string;
  LastSaved: string;
  Path: string; // Add the Path property to the type definition
};

type User = {
  userId: string;
  keys: Key[];
};

type UserData = {
  users: User[];
};
const UserData = {
  users: [
    {
      userId: "1137",
      keys: [
        {
          key: "1",
          Title: "sample-testing.pdf",
          TemplateName: "International original",
          LastSaved: "5 hours ago",
          Path:'public/uploads/4321/sample-testing.pdf'
        },
        {
          key: "2",
          Title: "Jim.doc",
          TemplateName: "International banking",
          LastSaved: "2 hours ago",
          Path:'public/uploads/4321/sample-testing.pdf'
        },
        {
          key: "3",
          Title: "Joe.pdf",
          TemplateName: "International original",
          LastSaved: "21 minutes ago",
          Path:'public/uploads/4321/sample-testing.pdf'
        },
        {
          key: "4",
          Title: "alex.pdf",
          TemplateName: "staffing",
          LastSaved: "21 minutes ago",
          Path:'public/uploads/4321/sample-testing.pdf'
        },
        {
          key: "5",
          Title: "alex.pdf",
          TemplateName: "staffing",
          LastSaved: "21 minutes ago",
          Path:'public/uploads/4321/sample-testing.pdf'
        },
        {
          key: "6",
          Title: "alex.pdf",
          TemplateName: "staffing",
          LastSaved: "21 minutes ago",
          Path:'public/uploads/4321/sample-testing.pdf'
        },
        {
          key: "7",
          Title: "alex.pdf",
          TemplateName: "staffing",
          LastSaved: "21 minutes ago",
          Path:'public/uploads/4321/sample-testing.pdf'
        },
        {
          key: "8",
          Title: "alex.pdf",
          TemplateName: "staffing",
          LastSaved: "21 minutes ago",
          Path:'public/uploads/4321/sample-testing.pdf'
        },
      ],
    },
    {
      userId: "5432",
      keys: [
        {
          key: "1",
          Title: "Brown.pdf",
          TemplateName: "Brownas.pdf",
          LastSaved: "5 hours ago",
        },
        {
          key: "2",
          Title: "Jim.doc",
          TemplateName: "Green.doc",
          LastSaved: "2 hours ago",
        },
        {
          key: "3",
          Title: "Joe.pdf",
          TemplateName: "Black.pdf",
          LastSaved: "21 minutes ago",
        },
        {
          key: "4",
          Title: "alex.pdf",
          TemplateName: "hav.pdf",
          LastSaved: "21 minutes ago",
        },
      ],
    },
  ],
};
export default UserData;
