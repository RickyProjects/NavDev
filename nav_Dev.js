document.getElementById("input-file").addEventListener("change", async e => {
 const file = e.target.files[0];
 if (!file) return;


 const formData = new FormData();
 formData.append("file", file);


 const res = await fetch("/run", {
   method: "POST",
   body: formData
 });


 const result = await res.json();
 console.log(result);
});
