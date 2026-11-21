# Portfolio Development Prompts

ISBA 2438 Midterm Expanded Portfolio

This document collects the 13 prompts prepared for the portfolio project, with the revisions and clarifications made along the way. The Viber conversation is the record of the prompts actually sent and the resulting work.

## 1. Review the existing portfolio

I want to continue working on the portfolio website I built for Assignment 2. Please review my current pages, components, API routes, and backend data files first. I want to add a Learning Resource Library that fits the website’s current design. Use the existing tools and project structure. Before making changes, briefly explain what is already working and which files you plan to update.

## 2. Build the resource API

Please add the backend for my Learning Resource Library. Each resource should have a unique ID, a title, a URL, and a category, such as Tutorials, Documentation, or Tools. Add API routes to create, read, update, and delete resources. Save the data in a JSON file on the server. A successful creation should return HTTP 201 Created after the resource has been saved. Please explain the routes and show me how to test them.

**Testing follow-up**

Please build on the resource code already in this project. Run the API checks with temporary data, clean up test records, and stop only the server you start for the test.

## 3. Add the library page and resource cards

Please add a Learning Resources page to my existing website and include it in the navigation. Visitors should be able to browse resources and open their links. The parent component should fetch the resource list from the API and keep it in state. Create a reusable ResourceCard component that receives each resource through props and displays its title, link, and category. Match the colors, fonts, and spacing already used on my website.

## 4. Finish the resource management interface

Please add the forms and buttons needed to manage resources on the website. I should be able to add a resource, edit its information, and delete it after confirming. All changes should go through the API and appear in the list after the server confirms success. Check that the title and category are filled in and that the URL is valid. Include clear loading, success, empty-list, and error messages.

## 5. Add My Learning List with LocalStorage

I also want visitors to keep a personal learning list. Add a Save to My Learning List button to each resource card. Visitors should be able to view their saved resources, add or edit a short personal note, and remove items from the list. Save this information in browser LocalStorage using JSON.stringify. Load it with getItem and JSON.parse so the saved resources and notes appear again after a refresh. Prevent duplicate saved items.

## 6. Review LocalStorage behavior

Please test My Learning List with no saved data, valid saved data, invalid JSON, and saved data with missing fields. Make sure the first page load does not overwrite existing saved items with an empty list. Check that saved resources and notes appear again after a refresh. If the browser blocks LocalStorage, keep the library usable and show a clear message when a save fails. Please also explain what happens if a resource is later edited or deleted from the server, and make sure the saved list can still be displayed safely.

## 7. Complete the blog interface

Please review the blog section in my existing portfolio. Make sure I can create, view, edit, and delete blog posts through the website. These actions should use the API and save changes to backend JSON. Keep the fields and design that my blog already uses. Fix any missing operations, and check that changes are still there after refreshing the page and restarting the server. Show me what you changed and how to test it.

## 8. Complete the project interface

Please review the Projects section next. It currently loads projects from `data/projects.ts`. Use the existing projects as the starting data for a backend JSON file, and keep their content and detail page URLs. Follow the API pattern already used for resources and blogs.

Make sure I can add, view, edit, and delete projects through the website. Keep the current project layout. Update the displayed list after a successful change and show a clear message if something fails. Use a temporary project to test all four actions. After editing it, restart the server and check that the edit is still there. Then delete the test project and confirm that the original projects still appear.

## 9. Complete the contact submission interface

Please review my existing contact form and complete the missing CRUD features. Keep the public form working with `POST /api/contacts` and keep the existing `/api/contact` route working. Add an admin page where I can view, edit, and delete saved submissions through the API. Save changes to the same backend JSON file.

Limit access to viewing, editing, and deleting submissions to the local demo or an existing protected admin area. Apply the same access rule to the admin page and its API routes. Check required fields and email addresses, ask for confirmation before deleting, and show clear success and error messages.

Use fake submissions to test all four actions. After editing a test submission, restart the server and check that the edit is still there. Then delete the test record. Keep real contact submissions out of Git and server logs.

## 10. Review components and website integration

Please review the updated website and reuse components wherever it makes the code easier to understand. Check repeated items such as resource cards, blog posts, and projects. Keep API fetching in the parent components and pass the data each card needs through props. Check that the navigation and earlier pages still work, and that forms and buttons are easy to use on a phone screen.

Please also make contact management opt-in for the local demo through a server setting that is off by default. When it is off, the contact admin page should explain that management is unavailable, and the API should return 403 for viewing, editing, or deleting submissions. The public contact form should still work. Briefly explain how to enable the setting for a local demo.

## 11. Test the API and fix problems

Please test the full website through its normal interface. Check CRUD for resources, blog posts, projects, and contact submissions using temporary test records. Verify that changes reach the backend JSON and remain after a server restart.

Add simple server logs that show the request method, route, and response status without logging private form contents. Create a test resource and show the HTTP 201 Created response and the matching server log. Also test invalid input, missing IDs, and failed requests.

Fix any problems you find and report which checks actually passed. Separate the checks you ran in a browser from those you ran directly against the API.

## 12. Explain the finished code

Please explain the finished code in plain English so I can describe it in my own words. Use the actual file and function names.

Walk me through what happens when I add a resource, from the form to the API, the server’s JSON file, and the `201 Created` response. Show where `ResourceList` fetches resources and how it passes each one to `ResourceCard` through props.

For My Learning List, trace what happens when I type and save a note. Explain how the note moves from draft state to `JSON.stringify` and `setItem`. Then explain what happens after refresh, from `getItem` and `JSON.parse` through `useSyncExternalStore` to the list on the page.

Finish with one design choice, one limitation of LocalStorage, and one real issue you found and fixed while testing. Point me to the code I should open for each part.

## 13. Prepare the final review and submission checklist

Please do a final review of my Assignment 2 portfolio against the assignment requirements. Tell me what is complete and what I still need to check. Update the README with the setup steps, how to run the site, and how to enable contact management for a local demo.

Give me a walkthrough checklist that fits within ten minutes. Include the existing portfolio, the Learning Resource Library, the four CRUD interfaces, a resource creation that returns `201 Created` with its matching server log, and a saved learning note that appears again after refresh. Include a quick check for invalid LocalStorage data. Point me to the code for the API, JSON storage, and the props passed from `ResourceList` to `ResourceCard` so I can explain them in my own words.

Check whether the project has an open-source license and whether real contact submissions and local environment files are excluded from Git. Check whether there is a public GitHub repository and a final commit containing these changes. If either is missing, tell me what I still need to do to get the repository URL and full commit SHA. The assignment ID is `midterm`. The handout lists different rubric versions, so remind me to confirm which version the submission portal expects.

## Resource library clarifications

### Entry fields and links

Each resource should have a title, a link, and a category. The server should give each resource a unique ID so I can edit or delete it. Keep the library on one page in my existing portfolio. Visitors can click a resource link to open the tutorial, documentation, or tool directly.

### Resource management page

Please add an `/admin/resources` page that follows the same design as my existing `/admin/blogs` page. I should be able to add, view, edit, and delete resources there. Each form should use the resource’s title, link, and category. All changes should go through the API and be saved to the server’s JSON file. When a new resource is saved successfully, return HTTP 201 Created. Visitors can browse the resources and open the links on the public library page.

### Page and API paths

Use `/resources` for the public library and `/admin/resources` for the management page. Use `GET` and `POST` on `/api/resources` to list and add resources. Use `PATCH` and `DELETE` on `/api/resources/:id` to edit or remove a resource.

## License and local commit follow-up

Yes, please add the standard MIT license to my portfolio project. Review the files before staging them. Keep real contact submissions, local environment files, and temporary test output out of the commit. Run lint and the production build, then make a local commit on `main`. Show me the commit message, the full commit SHA, and whether there are any uncommitted changes. Keep the commit local so I can review it before publishing it to GitHub.
