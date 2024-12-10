import common, { getProps } from "../common/base-create-update.mjs";
import contentNote from "../../common/sobjects/content-note.mjs";

const docsLink = "https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_contentnote.htm";

/* eslint-disable no-unused-vars */
const {
  useAdvancedProps, ...props
} = getProps({
  objType: contentNote,
  docsLink,
});
/* eslint-enable no-unused-vars */

export default {
  ...common,
  key: "salesforce_rest_api-create-content-note",
  name: "Create Content Note",
  description: `Creates a content note. [See the documentation](${docsLink}) and [Set Up Notes](https://help.salesforce.com/s/articleView?id=sales.notes_admin_setup.htm&type=5).`,
  version: "0.0.1",
  type: "action",
  props,
  async run({ $ }) {
    /* eslint-disable no-unused-vars */
    const {
      salesforce,
      getAdvancedProps,
      getAdditionalFields,
      formatDateTimeProps,
      docsInfo,  ...data
    } = this;
    /* eslint-enable no-unused-vars */

    await salesforce.createRecord("ContentVersion", {
      $,
      data: {
        Title: data.Title,
        VersionData: Buffer.from(data.Content).toString("base64"),
        PathOnClient: `${data.Title}.snote`,
        FirstPublishLocationId: data.OwnerId,
      },
    });

    const response = await salesforce.createRecord("ContentNote", {
      $,
      data,
    });

    $.export("$summary", `Successfully created content note "${this.Title}"`);
    return response;
  },
};
